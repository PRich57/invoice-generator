import logging
from datetime import date

from sqlalchemy import select, func, or_, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import aliased, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.exceptions import (BadRequestException, InvoiceNotFoundException,
                                InvoiceNumberAlreadyExistsException)
from ...models.contact import Contact
from ...models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ...schemas.invoice import InvoiceCreate

logger = logging.getLogger(__name__)


async def get_invoice(db: AsyncSession, invoice_id: int, user_id: int) -> Invoice | None:
    stmt = select(Invoice).options(
        selectinload(Invoice.items).selectinload(InvoiceItem.subitems),
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to)
    ).filter(Invoice.id == invoice_id, Invoice.user_id == user_id)
    result = await db.execute(stmt)
    invoice = result.scalar_one_or_none()
    
    if invoice:
        # Sort items and subitems after fetching
        invoice.items.sort(key=lambda x: x.order if x.order is not None else float('inf'))
        for item in invoice.items:
            item.subitems.sort(key=lambda x: x.order if x.order is not None else float('inf'))

    return invoice


async def get_invoices(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    sort_by: str | None = None,
    sort_order: str = 'asc',
    invoice_number: str | None = None,
    bill_to_name: str | None = None,
    send_to_name: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    total_min: float | None = None,
    total_max: float | None = None
) -> list[Invoice]:
    BillToContact = aliased(Contact)
    SendToContact = aliased(Contact)

    stmt = select(Invoice).options(
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to)
    ).filter(Invoice.user_id == user_id)

    # Apply filters
    if invoice_number:
        stmt = stmt.filter(Invoice.invoice_number.ilike(f"%{invoice_number}%"))
    if bill_to_name:
        stmt = stmt.join(BillToContact, Invoice.bill_to).filter(BillToContact.name.ilike(f"%{bill_to_name}%"))
    if send_to_name:
        stmt = stmt.join(SendToContact, Invoice.send_to).filter(SendToContact.name.ilike(f"%{send_to_name}%"))
    if date_from:
        stmt = stmt.filter(Invoice.invoice_date >= date_from)
    if date_to:
        stmt = stmt.filter(Invoice.invoice_date <= date_to)
    if total_min is not None:
        stmt = stmt.filter(Invoice.total >= total_min)
    if total_max is not None:
        stmt = stmt.filter(Invoice.total <= total_max)

    # Apply sorting
    if sort_by:
        order_func = func.asc if sort_order == 'asc' else func.desc
        sort_column = {
            'invoice_number': Invoice.invoice_number,
            'bill_to_name': BillToContact.name,
            'send_to_name': SendToContact.name,
            'date': Invoice.invoice_date,
            'total': Invoice.total
        }.get(sort_by)
        if sort_column is not None:
            stmt = stmt.order_by(order_func(sort_column))

    # Apply pagination
    stmt = stmt.offset(skip).limit(limit)

    result = await db.execute(stmt)
    return result.scalars().all()


async def create_invoice(db: AsyncSession, invoice: InvoiceCreate, user_id: int) -> Invoice:
    logger.info(f"Creating invoice with data: {invoice.model_dump()}")
    try:
        invoice_data = invoice.model_dump(exclude={'items', 'template_id'})
        db_invoice = Invoice(**invoice_data, user_id=user_id, template_id=invoice.template_id)

        # Add items and subitems
        for index, item_data in enumerate(invoice.items):
            db_item = InvoiceItem(**item_data.model_dump(exclude={'subitems'}), order=index)
            db_invoice.items.append(db_item)
            for sub_index, subitem_data in enumerate(item_data.subitems):
                db_subitem = InvoiceSubItem(**subitem_data.model_dump(), order=sub_index)
                db_item.subitems.append(db_subitem)

        # Calculate totals
        db_invoice.calculate_totals()

        db.add(db_invoice)
        await db.commit()
        await db.refresh(db_invoice)
        
        await db.refresh(db_invoice, attribute_names=['items'])
        for item in db_invoice.items:
            await db.refresh(item, attribute_names=['subitems'])

        logger.info(f"Invoice created successfully: ID {db_invoice.id}")
        return db_invoice
    except IntegrityError as e:
        await db.rollback()
        logger.error(f"IntegrityError while creating invoice: {str(e)}")
        if "invoice_number" in str(e):
            raise InvoiceNumberAlreadyExistsException()
        raise BadRequestException("An error occurred while creating the invoice")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An unexpected error occurred while creating the invoice")


async def update_invoice(db: AsyncSession, invoice_id: int, invoice: InvoiceCreate, user_id: int) -> Invoice:
    db_invoice = await get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise InvoiceNotFoundException()

    try:
        # Update invoice fields
        for key, value in invoice.model_dump(exclude={'items'}).items():
            setattr(db_invoice, key, value)

        # Update items
        new_items = []
        for index, item_data in enumerate(invoice.items):
            if item_data.id and any(existing_item.id == item_data.id for existing_item in db_invoice.items):
                db_item = next(item for item in db_invoice.items if item.id == item_data.id)
                for key, value in item_data.model_dump(exclude={'subitems', 'id'}).items():
                    setattr(db_item, key, value)
            else:
                db_item = InvoiceItem(**item_data.model_dump(exclude={'id', 'subitems'}))
                db.add(db_item)

            db_item.order = index

            # Update subitems
            new_subitems = []
            for sub_index, subitem_data in enumerate(item_data.subitems):
                if subitem_data.id and any(existing_subitem.id == subitem_data.id for existing_subitem in db_item.subitems):
                    db_subitem = next(subitem for subitem in db_item.subitems if subitem.id == subitem_data.id)
                    for key, value in subitem_data.model_dump(exclude={'id'}).items():
                        setattr(db_subitem, key, value)
                else:
                    db_subitem = InvoiceSubItem(**subitem_data.model_dump(exclude={'id'}))
                    db.add(db_subitem)

                db_subitem.order = sub_index
                new_subitems.append(db_subitem)

            db_item.subitems = new_subitems
            new_items.append(db_item)

        db_invoice.items = new_items

        # Calculate totals
        db_invoice.calculate_totals()

        await db.commit()
        await db.refresh(db_invoice, attribute_names=['items'])
        for item in db_invoice.items:
            await db.refresh(item, attribute_names=['subitems'])

        return db_invoice

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An error occurred while updating the invoice")


async def delete_invoice(db: AsyncSession, invoice_id: int, user_id: int) -> Invoice:
    db_invoice = await get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    try:
        await db.delete(db_invoice)
        await db.commit()
        logger.info(f"Invoice deleted successfully: ID {invoice_id}")
        return db_invoice
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An error occurred while deleting the invoice")


async def get_grouped_invoices(
    db: AsyncSession,
    user_id: int,
    group_by: list[str],
    date_from: date | None = None,
    date_to: date | None = None
) -> dict:
    stmt = select(Invoice).filter(Invoice.user_id == user_id)

    if date_from:
        stmt = stmt.filter(Invoice.invoice_date >= date_from)
    if date_to:
        stmt = stmt.filter(Invoice.invoice_date <= date_to)

    group_columns = []
    for group in group_by:
        if group == 'bill_to':
            stmt = stmt.join(Contact, Invoice.bill_to_id == Contact.id)
            group_columns.append(Contact.name.label('bill_to_name'))
        elif group == 'send_to':
            stmt = stmt.join(Contact, Invoice.send_to_id == Contact.id)
            group_columns.append(Contact.name.label('send_to_name'))
        elif group == 'month':
            group_columns.append(func.date_trunc('month', Invoice.invoice_date).label('month'))
        elif group == 'year':
            group_columns.append(func.date_trunc('year', Invoice.invoice_date).label('year'))

    stmt = stmt.group_by(*group_columns).order_by(*group_columns)
    stmt = stmt.with_columns(
        func.count(Invoice.id).label('invoice_count'),
        func.sum(Invoice.total).label('total_amount')
    )

    result = await db.execute(stmt)
    rows = result.all()

    # Convert to a nested dictionary structure
    grouped_data = {}
    for row in rows:
        current_level = grouped_data
        for i, group in enumerate(group_by):
            key = getattr(row, group)
            if i == len(group_by) - 1:
                current_level[key] = {'count': row.invoice_count, 'total': float(row.total_amount)}
            else:
                if key not in current_level:
                    current_level[key] = {}
                current_level = current_level[key]

    return grouped_data