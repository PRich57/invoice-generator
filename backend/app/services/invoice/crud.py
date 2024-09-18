import logging
from datetime import date

from sqlalchemy import asc, desc, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, aliased, selectinload

from ...core.exceptions import (BadRequestException, InvoiceNotFoundException,
                                InvoiceNumberAlreadyExistsException)
from ...models.contact import Contact
from ...models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ...schemas.invoice import InvoiceCreate

logger = logging.getLogger(__name__)


def get_invoice(db: Session, invoice_id: int, user_id: int) -> Invoice | None:
    return db.query(Invoice).options(
        selectinload(Invoice.items).selectinload(InvoiceItem.subitems),
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to)
    ).filter(Invoice.id == invoice_id, Invoice.user_id == user_id).first()


def get_invoices(
    db: Session,
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

    query = db.query(Invoice).options(
        selectinload(Invoice.bill_to),
        selectinload(Invoice.send_to)
    ).filter(Invoice.user_id == user_id)

    # Apply filters
    if invoice_number:
        query = query.filter(Invoice.invoice_number.ilike(f"%{invoice_number}%"))
    if bill_to_name:
        query = query.join(BillToContact, Invoice.bill_to).filter(BillToContact.name.ilike(f"%{bill_to_name}%"))
    if send_to_name:
        query = query.join(SendToContact, Invoice.send_to).filter(SendToContact.name.ilike(f"%{send_to_name}%"))
    if date_from:
        query = query.filter(Invoice.invoice_date >= date_from)
    if date_to:
        query = query.filter(Invoice.invoice_date <= date_to)
    if total_min is not None:
        query = query.filter(Invoice.total >= total_min)
    if total_max is not None:
        query = query.filter(Invoice.total <= total_max)

    # Apply sorting
    if sort_by:
        order_func = asc if sort_order == 'asc' else desc
        sort_column = {
            'invoice_number': Invoice.invoice_number,
            'bill_to_name': BillToContact.name,
            'send_to_name': SendToContact.name,
            'date': Invoice.invoice_date,
            'total': Invoice.total
        }.get(sort_by)
        if sort_column is not None:
            query = query.order_by(order_func(sort_column))

    # Apply pagination
    query = query.offset(skip).limit(limit)

    return query.all()


def create_invoice(db: Session, invoice: InvoiceCreate, user_id: int) -> Invoice:
    logger.info(f"Creating invoice with data: {invoice.model_dump()}")
    try:
        invoice_data = invoice.model_dump(exclude={'items', 'template_id'})
        db_invoice = Invoice(**invoice_data, user_id=user_id, template_id=invoice.template_id)

        # Add items and subitems
        for item_data in invoice.items:
            db_item = InvoiceItem(**item_data.model_dump(exclude={'subitems'}))
            db_invoice.items.append(db_item)
            for subitem_data in item_data.subitems:
                db_subitem = InvoiceSubItem(**subitem_data.model_dump())
                db_item.subitems.append(db_subitem)

        # Calculate totals
        db_invoice.calculate_totals()

        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        logger.info(f"Invoice created successfully: ID {db_invoice.id}")
        return db_invoice
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError while creating invoice: {str(e)}")
        if "invoice_number" in str(e):
            raise InvoiceNumberAlreadyExistsException()
        raise BadRequestException("An error occurred while creating the invoice")
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An unexpected error occurred while creating the invoice")


def update_invoice(db: Session, invoice_id: int, invoice: InvoiceCreate, user_id: int) -> Invoice:
    db_invoice = get_invoice(db, invoice_id, user_id)

    if db_invoice is None:
        raise InvoiceNotFoundException()

    try:
        # Update invoice fields
        for key, value in invoice.model_dump(exclude={'items'}).items():
            setattr(db_invoice, key, value)

        # Efficiently update items
        existing_items = {item.id: item for item in db_invoice.items}
        new_item_ids = []

        for item_data in invoice.items:
            item_id = item_data.id
            if item_id and item_id in existing_items:
                # Update existing item
                db_item = existing_items[item_id]
                for key, value in item_data.model_dump(exclude={'subitems'}).items():
                    setattr(db_item, key, value)

                # Update subitems
                existing_subitems = {subitem.id: subitem for subitem in db_item.subitems}
                new_subitem_ids = []

                for subitem_data in item_data.subitems:
                    subitem_id = subitem_data.id
                    if subitem_id and subitem_id in existing_subitems:
                        # Update existing subitem
                        db_subitem = existing_subitems[subitem_id]
                        for key, value in subitem_data.model_dump().items():
                            setattr(db_subitem, key, value)
                    else:
                        # Add new subitem
                        db_subitem = InvoiceSubItem(**subitem_data.model_dump(exclude={'id'}))
                        db_item.subitems.append(db_subitem)
                        db.add(db_subitem)
                    if subitem_id:
                        new_subitem_ids.append(subitem_id)

                # Remove deleted subitems
                for subitem_id in set(existing_subitems.keys()) - set(new_subitem_ids):
                    subitem_to_remove = existing_subitems[subitem_id]
                    db_item.subitems.remove(subitem_to_remove)
                    db.delete(subitem_to_remove)
            else:
                # Add new item
                db_item = InvoiceItem(**item_data.model_dump(exclude={'id', 'subitems'}))
                db_invoice.items.append(db_item)
                db.add(db_item)
                for subitem_data in item_data.subitems:
                    db_subitem = InvoiceSubItem(**subitem_data.model_dump(exclude={'id'}))
                    db_item.subitems.append(db_subitem)
                    db.add(db_subitem)
            if item_id:
                new_item_ids.append(item_id)

        # Remove deleted items
        for item_id in set(existing_items.keys()) - set(new_item_ids):
            item_to_remove = existing_items[item_id]
            db_invoice.items.remove(item_to_remove)
            db.delete(item_to_remove)

        # Calculate totals
        db_invoice.calculate_totals()

        db.commit()
        db.refresh(db_invoice)
        logger.info(f"Invoice updated successfully: ID {db_invoice.id}")
        return db_invoice
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An error occurred while updating the invoice")


def delete_invoice(db: Session, invoice_id: int, user_id: int) -> Invoice:
    db_invoice = get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    try:
        db.delete(db_invoice)
        db.commit()
        logger.info(f"Invoice deleted successfully: ID {invoice_id}")
        return db_invoice
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting invoice: {str(e)}", exc_info=True)
        raise BadRequestException("An error occurred while deleting the invoice")


def get_grouped_invoices(
    db: Session,
    user_id: int,
    group_by: list[str],
    date_from: date | None = None,
    date_to: date | None = None
) -> dict:
    query = db.query(Invoice).filter(Invoice.user_id == user_id)

    if date_from:
        query = query.filter(Invoice.invoice_date >= date_from)
    if date_to:
        query = query.filter(Invoice.invoice_date <= date_to)

    group_columns = []
    for group in group_by:
        if group == 'bill_to':
            query = query.join(Contact, Invoice.bill_to_id == Contact.id)
            group_columns.append(Contact.name.label('bill_to_name'))
        elif group == 'send_to':
            query = query.join(Contact, Invoice.send_to_id == Contact.id)
            group_columns.append(Contact.name.label('send_to_name'))
        elif group == 'month':
            group_columns.append(func.date_trunc('month', Invoice.invoice_date).label('month'))
        elif group == 'year':
            group_columns.append(func.date_trunc('year', Invoice.invoice_date).label('year'))

    query = query.group_by(*group_columns).order_by(*group_columns)
    query = query.with_entities(*group_columns, func.count(Invoice.id).label('invoice_count'), func.sum(Invoice.total).label('total_amount'))

    result = query.all()

    # Convert to a nested dictionary structure
    grouped_data = {}
    for row in result:
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