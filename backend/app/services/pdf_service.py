from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from ..models.invoice import Invoice as InvoiceModel
from ..models.template import Template as TemplateModel

def generate_pdf(invoice: InvoiceModel, template: TemplateModel) -> bytes:
    buffer = BytesIO()
    page_size = A4 if template.layout['page_size'].upper() == 'A4' else letter
    doc = SimpleDocTemplate(buffer, pagesize=page_size,
                            topMargin=template.layout['margin_top'] * 72,
                            rightMargin=template.layout['margin_right'] * 72,
                            bottomMargin=template.layout['margin_bottom'] * 72,
                            leftMargin=template.layout['margin_left'] * 72)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='CustomTitle',
                              fontName=template.fonts['accent'],
                              fontSize=template.font_sizes['title'],
                              textColor=colors.HexColor(template.colors['primary'])))

    elements = []

    # Add invoice header
    elements.append(Paragraph(f"Invoice #{invoice.invoice_number}", styles['CustomTitle']))
    elements.append(Spacer(1, 12))

    # Add invoice details
    data = [
        ["Date:", invoice.invoice_date.strftime("%Y-%m-%d")],
        ["Bill To:", invoice.bill_to.name],
        ["Send To:", invoice.send_to.name],
    ]
    table = Table(data)
    table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                               ('FONTNAME', (0, 0), (-1, -1), template.fonts['main']),
                               ('FONTSIZE', (0, 0), (-1, -1), template.font_sizes['normal_text']),
                               ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(template.colors['primary']))]))
    elements.append(table)
    elements.append(Spacer(1, 12))

    # Add invoice items
    items_data = [["Description", "Quantity", "Rate", "Amount"]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"${item.unit_price:.2f}",
            f"${item.quantity * item.unit_price:.2f}"
        ])
    items_table = Table(items_data)
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(template.colors['accent'])),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), template.fonts['accent']),
        ('FONTSIZE', (0, 0), (-1, 0), template.font_sizes['table_header']),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor(template.colors['secondary'])),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor(template.colors['primary'])),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), template.fonts['main']),
        ('FONTSIZE', (0, 1), (-1, -1), template.font_sizes['normal_text']),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor(template.colors['primary']))
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
        ('FONTNAME', (0, -1), (-1, -1), template.fonts['accent']),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor(template.colors['primary'])),
    ]))
    elements.append(totals_table)

    # Build the PDF
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf