import logging
from datetime import date
from typing import Any, Dict, List

from sqlalchemy import Integer, select, func, or_, desc, asc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import aliased, selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.exceptions import BadRequestError, NotFoundError, AlreadyExistsError
from ...models.contact import Contact
from ...models.template import Template
from ...models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ...schemas.invoice import InvoiceCreate

logger = logging.getLogger(__name__)

async def get_invoice(db: AsyncSession, invoice_id: int, user_id: int) -> Invoice | None:
    stmt = select(Invoice).options(
        selectinload(Invoice.items).selectinload(InvoiceItem.subitems),
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to),
        selectinload(Invoice.template)
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
    group_by: List[str] = [],
    invoice_number: str | None = None,
    bill_to_name: str | None = None,
    send_to_name: str | None = None,
    client_type: str | None = None,
    invoice_type: str | None = None,
    status: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    total_min: float | None = None,
    total_max: float | None = None
) -> tuple[Dict[str, Any], int]:
    BillToContact = aliased(Contact)
    SendToContact = aliased(Contact)
    AliasedTemplate = aliased(Template)

    stmt = select(Invoice).options(
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to),
        selectinload(Invoice.template)
    ).filter(Invoice.user_id == user_id)

    # Apply filters
    if invoice_number:
        stmt = stmt.filter(Invoice.invoice_number.ilike(f"%{invoice_number}%"))
    if bill_to_name:
        stmt = stmt.join(BillToContact, Invoice.bill_to).filter(BillToContact.name.ilike(f"%{bill_to_name}%"))
    if send_to_name:
        stmt = stmt.join(SendToContact, Invoice.send_to).filter(SendToContact.name.ilike(f"%{send_to_name}%"))
    if client_type:
        stmt = stmt.filter(Invoice.client_type == client_type)
    if invoice_type:
        stmt = stmt.filter(Invoice.invoice_type == invoice_type)
    if status:
        stmt = stmt.filter(Invoice.status == status)
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
        order_func = desc if sort_order.lower() == 'desc' else asc
        sort_column = {
            'invoice_number': Invoice.invoice_number,
            'bill_to_name': BillToContact.name,
            'send_to_name': SendToContact.name,
            'date': Invoice.invoice_date,
            'total': Invoice.total,
            'template_name': AliasedTemplate.name,
            'status': Invoice.status,
            'client_type': Invoice.client_type,
            'invoice_type': Invoice.invoice_type
        }.get(sort_by)
        if sort_column is not None:
            if sort_by in ['template_name', 'bill_to_name', 'send_to_name']:
                if sort_by == 'template_name':
                    stmt = stmt.join(AliasedTemplate, Invoice.template)
                elif sort_by == 'bill_to_name':
                    stmt = stmt.join(BillToContact, Invoice.bill_to)
                elif sort_by == 'send_to_name':
                    stmt = stmt.join(SendToContact, Invoice.send_to)
            stmt = stmt.order_by(order_func(sort_column))

    # Apply grouping
    if group_by:
        # Perform grouping
        group_columns = [...]  # Define group columns based on group_by
        stmt = stmt.group_by(*group_columns)
        
        # Get total counts and sums for each group
        count_stmt = select([*group_columns, func.count().label('count'), func.sum(Invoice.total).label('total')])
        count_stmt = count_stmt.group_by(*group_columns)
        group_results = await db.execute(count_stmt)
        group_data = {tuple(r[:-2]): {'count': r[-2], 'total': r[-1]} for r in group_results}
        
        # Apply pagination to the main query
        stmt = stmt.offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        invoices = result.all()
        
        # Organize results into groups
        grouped_invoices = {}
        for invoice in invoices:
            group_key = tuple(getattr(invoice, col) for col in group_columns)
            if group_key not in grouped_invoices:
                grouped_invoices[group_key] = []
            grouped_invoices[group_key].append(invoice)
        
        # Combine with total counts and sums
        final_result = {
            group: {
                'invoices': grouped_invoices.get(group, []),
                'count': group_data[group]['count'],
                'total': group_data[group]['total']
            }
            for group in group_data
        }
        
        total_count = sum(data['count'] for data in group_data.values())
        
        return final_result, total_count
    else:
        # Non-grouped query (existing logic)
        total_count = await db.scalar(select(func.count()).select_from(stmt.subquery()))
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        invoices = result.scalars().all()
        return invoices, total_count


async def create_invoice(db: AsyncSession, invoice: InvoiceCreate, user_id: int) -> Invoice:
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


        return db_invoice
    except IntegrityError as e:
        await db.rollback()
        if "invoice_number" in str(e):
            raise AlreadyExistsError("invoice")
        raise BadRequestError("An error occurred while creating the invoice")
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        await db.rollback()
        raise BadRequestError("An unexpected error occurred while creating the invoice")


async def update_invoice(db: AsyncSession, invoice_id: int, invoice: InvoiceCreate, user_id: int) -> Invoice:
    db_invoice = await get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise NotFoundError("invoice")

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
                db_invoice.items.append(db_item)

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
                    db_item.subitems.append(db_subitem)

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
        raise BadRequestError("An error occurred while updating the invoice")


async def delete_invoice(db: AsyncSession, invoice_id: int, user_id: int) -> Invoice:
    db_invoice = await get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise NotFoundError("invoice")
    try:
        await db.delete(db_invoice)
        await db.commit()
        logger.info(f"Invoice deleted successfully: ID {invoice_id}")
        return db_invoice
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting invoice: {str(e)}", exc_info=True)
        raise BadRequestError("An error occurred while deleting the invoice")


async def get_grouped_invoices(
    db: AsyncSession,
    user_id: int,
    group_by: List[str],
    date_from: date | None = None,
    date_to: date | None = None
) -> dict:
    stmt = select(Invoice)

    BillToContact = aliased(Contact)
    SendToContact = aliased(Contact)
    AliasedTemplate = aliased(Template)

    stmt = stmt.filter(Invoice.user_id == user_id)

    if date_from:
        stmt = stmt.filter(Invoice.invoice_date >= date_from)
    if date_to:
        stmt = stmt.filter(Invoice.invoice_date <= date_to)

    group_columns = []
    for group in group_by:
        if group == 'bill_to':
            stmt = stmt.join(BillToContact, Invoice.bill_to)
            group_columns.append(BillToContact.name.label('bill_to_name'))
        elif group == 'send_to':
            stmt = stmt.join(SendToContact, Invoice.send_to)
            group_columns.append(SendToContact.name.label('send_to_name'))
        elif group == 'month':
            group_columns.append(func.to_char(Invoice.invoice_date, 'MM/YYYY').label('month'))
        elif group == 'year':
            group_columns.append(func.extract('year', Invoice.invoice_date).cast(Integer).label('year'))
        elif group == 'status':
            group_columns.append(Invoice.status.label('status'))
        elif group == 'client_type':
            group_columns.append(Invoice.client_type.label('client_type'))
        elif group == 'invoice_type':
            group_columns.append(Invoice.invoice_type.label('invoice_type'))

    if group_columns:
        stmt = stmt.group_by(*group_columns)

    stmt = stmt.with_only_columns([
        *group_columns,
        func.count(Invoice.id).label('invoice_count'),
        func.sum(Invoice.total).label('total_amount')
    ]).order_by(*group_columns)

    try:
        result = await db.execute(stmt)
        rows = result.all()

        grouped_data = {}

        for row in rows:
            if not group_by:
                group_key = 'All Invoices'
            else:
                first_group = group_by[0]
                if first_group == 'bill_to':
                    group_key = row.bill_to_name
                elif first_group == 'send_to':
                    group_key = row.send_to_name
                elif first_group == 'month':
                    group_key = row.month.strip()
                elif first_group == 'year':
                    group_key = int(row.year)
                elif first_group == 'status':
                    group_key = row.status
                elif first_group == 'client_type':
                    group_key = row.client_type
                elif first_group == 'invoice_type':
                    group_key = row.invoice_type
                else:
                    group_key = 'Others'

            # Initialize group if not present
            if group_key not in grouped_data:
                grouped_data[group_key] = {
                    'invoice_count': 0,
                    'total_amount': 0.0
                }

            # Aggregate data
            grouped_data[group_key]['invoice_count'] += row.invoice_count
            grouped_data[group_key]['total_amount'] += float(row.total_amount) if row.total_amount else 0.0

        return grouped_data

    except Exception as e:
        logger.error(f"Error in get_grouped_invoices: {str(e)}", exc_info=True)
        raise BadRequestError("An error occurred while fetching grouped invoices")