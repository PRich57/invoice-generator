from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

from ..models.invoice import Invoice as InvoiceModel
from ..models.template import Template as TemplateModel


def generate_pdf(invoice: InvoiceModel, template: TemplateModel) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []

    # Add invoice header
    elements.append(Paragraph(f"Invoice #{invoice.invoice_number}", styles['Title']))
    elements.append(Spacer(1, 12))

    # Add invoice details
    data = [
        ["Date:", invoice.date_of_service.strftime("%Y-%m-%d")],
        ["Bill To:", invoice.bill_to.name],
        ["Send To:", invoice.send_to.name],
    ]
    table = Table(data)
    table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'LEFT')]))
    elements.append(table)
    elements.append(Spacer(1, 12))

    # Add invoice items
    items_data = [["Description", "Quantity", "Rate", "Amount"]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"${item.rate:.2f}",
            f"${item.quantity * item.rate:.2f}"
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
        ["Tax:", f"${invoice.tax:.2f}"],
        ["Total:", f"${invoice.total:.2f}"]
    ]
    totals_table = Table(totals_data)
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(totals_table)

    # Build the PDF
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf