from datetime import date
import logging
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..core.exceptions import (BadRequestException, ContactNotFoundException,
                               InvalidInvoiceNumberException,
                               InvoiceNotFoundException,
                               InvoiceNumberAlreadyExistsException,
                               TemplateNotFoundException)
from ..models.contact import Contact
from ..models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ..models.template import Template
from ..schemas.invoice import InvoiceCreate
from .pdf_generator import generate_pdf
from sqlalchemy import asc, desc, func

logger = logging.getLogger(__name__)

def get_invoice(db: Session, invoice_id: int, user_id: int) -> Invoice | None:
    return db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == user_id).first()

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
    query = db.query(Invoice).filter(Invoice.user_id == user_id)

    # Apply filters
    if invoice_number:
        query = query.filter(Invoice.invoice_number.ilike(f"%{invoice_number}%"))
    if bill_to_name:
        query = query.join(Contact, Invoice.bill_to_id == Contact.id).filter(Contact.name.ilike(f"%{bill_to_name}%"))
    if send_to_name:
        query = query.join(Contact, Invoice.send_to_id == Contact.id).filter(Contact.name.ilike(f"%{send_to_name}%"))
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
        if sort_by == 'invoice_number':
            query = query.order_by(order_func(Invoice.invoice_number))
        elif sort_by == 'bill_to_name':
            query = query.join(Contact, Invoice.bill_to_id == Contact.id).order_by(order_func(Contact.name))
        elif sort_by == 'send_to_name':
            query = query.join(Contact, Invoice.send_to_id == Contact.id).order_by(order_func(Contact.name))
        elif sort_by == 'date':
            query = query.order_by(order_func(Invoice.invoice_date))
        elif sort_by == 'total':
            query = query.order_by(order_func(Invoice.total))

    # Apply pagination
    query = query.offset(skip).limit(limit)

    return query.all()

def generate_invoice_pdf(db: Session, invoice_id: int, template_id: int, user_id: int) -> bytes:
    invoice = get_invoice(db, invoice_id, user_id)
    if not invoice:
        raise InvoiceNotFoundException()
    
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise TemplateNotFoundException()
    
    return generate_pdf(invoice, template)

def create_invoice(db: Session, invoice: InvoiceCreate, user_id: int) -> Invoice:
    logger.info(f"Creating invoice with data: {invoice.model_dump()}")
    try:
        invoice_data = invoice.model_dump(exclude={'items', 'template_id'})
        db_invoice = Invoice(**invoice_data, user_id=user_id, template_id=invoice.template_id)
        
        db.add(db_invoice)
        db.flush()  # Flush to get the invoice ID without committing

        # Prepare bulk insert for items and subitems
        items = []
        subitems = []
        for item in invoice.items:
            db_item = InvoiceItem(**item.model_dump(exclude={'subitems'}), invoice_id=db_invoice.id)
            items.append(db_item)
            for subitem in item.subitems:
                db_subitem = InvoiceSubItem(**subitem.model_dump(), invoice_item=db_item)
                subitems.append(db_subitem)

        db.bulk_save_objects(items)
        db.bulk_save_objects(subitems)

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

def generate_preview_pdf(db: Session, invoice: InvoiceCreate, template: Template) -> bytes:
    preview_invoice = Invoice(
        id=0,
        user_id=0,
        invoice_number=invoice.invoice_number,
        invoice_date=invoice.invoice_date,
        bill_to_id=invoice.bill_to_id,
        send_to_id=invoice.send_to_id,
        tax_rate=Decimal(invoice.tax_rate),
        discount_percentage=Decimal(invoice.discount_percentage),
        notes=invoice.notes,
        template_id=template.id
    )
    
    preview_invoice.bill_to = db.query(Contact).get(invoice.bill_to_id)
    preview_invoice.send_to = db.query(Contact).get(invoice.send_to_id)
    
    preview_invoice.items = [
        InvoiceItem(
            id=0,
            invoice_id=0,
            description=item.description,
            quantity=Decimal(item.quantity),
            unit_price=Decimal(item.unit_price),
            discount_percentage=Decimal(item.discount_percentage),
            subitems=[
                InvoiceSubItem(
                    id=0,
                    invoice_item_id=0,
                    description=subitem.description
                ) for subitem in item.subitems
            ]
        ) for item in invoice.items
    ]
    
    return generate_pdf(preview_invoice, template)

def update_invoice(db: Session, invoice_id: int, invoice: InvoiceCreate, user_id: int) -> Invoice:
    db_invoice = get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    
    if invoice.template_id is not None:
        template = db.query(Template).filter(Template.id == invoice.template_id, Template.user_id == user_id).first()
        if not template:
            raise TemplateNotFoundException()

    try:
        # Update invoice fields
        for key, value in invoice.model_dump(exclude={'items'}).items():
            setattr(db_invoice, key, value)

        # Update items
        db_invoice.items = []
        for item in invoice.items:
            db_item = InvoiceItem(**item.model_dump(exclude={'subitems'}), invoice_id=invoice_id)
            db_invoice.items.append(db_item)
            db_item.subitems = [InvoiceSubItem(**subitem.model_dump()) for subitem in item.subitems]

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