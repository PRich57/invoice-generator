import logging
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)
from sqlalchemy.orm import Session

from backend.app.services import pdf_service, template_service

from ..core.exceptions import (BadRequestException, ContactNotFoundException,
                               InvalidInvoiceNumberException, InvoiceNotFoundException,
                               InvoiceNumberAlreadyExistsException, TemplateNotFoundException)
from ..models.contact import Contact
from ..models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ..models.template import Template
from ..schemas.invoice import InvoiceCreate
from .pdf_generator import generate_pdf

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_invoice(db: Session, invoice_id: int, user_id: int):
    return db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.user_id == user_id).first()

def get_invoices(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Invoice).filter(Invoice.user_id == user_id).offset(skip).limit(limit).all()

def generate_invoice_pdf(db: Session, invoice_id: int, template_id: int, user_id: int) -> bytes:
    invoice = get_invoice(db, invoice_id, user_id)
    if not invoice:
        raise InvoiceNotFoundException()
    
    template = template_service.get_template(db, template_id, user_id)
    if not template:
        raise TemplateNotFoundException()
    
    return generate_pdf(invoice, template)

def create_invoice(db: Session, invoice: InvoiceCreate, user_id: int):
    logger.info(f"Creating invoice with data: {invoice.model_dump()}")
    try:

        invoice_data = invoice.model_dump(exclude={'items', 'template_id'})
        db_invoice = Invoice(
            **invoice_data,
            user_id=user_id,
            template_id=invoice.template_id  
        )
        db.add(db_invoice)
        db.flush()  

        for item in invoice.items:
            db_item = InvoiceItem(
                **item.model_dump(exclude={'subitems'}),
                invoice_id=db_invoice.id
            )
            db.add(db_item)
            db.flush()

            for subitem in item.subitems:
                db_subitem = InvoiceSubItem(**subitem.model_dump(), invoice_item_id=db_item.id)
                db.add(db_subitem)

        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}", exc_info=True)
        db.rollback()
        raise
    
def generate_preview_pdf(invoice: InvoiceCreate, template: Template) -> bytes:
    # Convert InvoiceCreate to Invoice
    preview_invoice = Invoice(
        id=0,  # Use a dummy ID
        user_id=0,  # Use a dummy user ID
        **invoice.dict(exclude={'items'}),
        items=[InvoiceItem(**item.dict()) for item in invoice.items]
    )
    return generate_pdf(preview_invoice, template)
def update_invoice(db: Session, invoice_id: int, invoice: InvoiceCreate, user_id: int):
    db_invoice = get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        return None
    
    if invoice.template_id is not None:
        template = db.query(Template).filter(Template.id == invoice.template_id, Template.user_id == user_id).first()
        if not template:
            raise TemplateNotFoundException()

    for key, value in invoice.model_dump(exclude={'items'}).items():
        setattr(db_invoice, key, value)

    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).delete()
    for item in invoice.items:
        db_item = InvoiceItem(**item.model_dump(), invoice_id=invoice_id)
        db.add(db_item)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int, user_id: int):
    db_invoice = get_invoice(db, invoice_id, user_id)
    if db_invoice is None:
        return None
    db.delete(db_invoice)
    db.commit()
    return db_invoice

def regenerate_invoice(invoice: Invoice, template: Template) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Add invoice header
    elements.append(Paragraph(f"Invoice #{invoice.invoice_number}", styles['Title']))
    elements.append(Spacer(1, 12))

    # Add invoice details
    data = [
        ["Date:", invoice.invoice_date.strftime("%Y-%m-%d")],
        ["Bill To:", invoice.bill_to.name],
        ["Send To:", invoice.send_to.name],
    ]
    table = Table(data)
    table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'LEFT')]))
    elements.append(table)
    elements.append(Spacer(1, 12))

    # Add invoice items
    items_data = [["Description", "Quantity", "Unit Price", "Discount", "Line Total"]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"${abs(item.unit_price):.2f}",
            f"{item.discount_percentage}%",
            f"${item.line_total:.2f}"
        ])
    items_table = Table(items_data)
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 12),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 12))

    # Add totals
    totals_data = [
        ["Subtotal:", f"${invoice.subtotal:.2f}"],
        ["Invoice Discount:", f"{invoice.discount_percentage}%"],
        ["Tax:", f"${invoice.tax:.2f}"],
        ["Total:", f"${invoice.total:.2f}"]
    ]
    totals_table = Table(totals_data)
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(totals_table)
    
    # Add notes if provided
    if invoice.notes:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Notes:", styles['Heading3']))
        elements.append(Paragraph(invoice.notes, styles['Normal']))

    # Apply template styles (simplified example)
    for element in elements:
        if isinstance(element, Paragraph):
            element.style.fontName = template.content.get('font', 'Helvetica')
            element.style.fontSize = template.content.get('font_size', 12)
            element.style.textColor = template.content.get('text_color', colors.black)

    # Build the PDF
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf