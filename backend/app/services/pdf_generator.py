from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from ..schemas.invoice import Invoice
from ..models.template import Template

def generate_pdf(invoice: Invoice, template: Template) -> bytes:
    buffer = BytesIO()
    page_size = A4 if template.layout['page_size'].upper() == 'A4' else letter
    doc = SimpleDocTemplate(
        buffer,
        pagesize=page_size,
        topMargin=template.layout['margin_top'] * inch,
        rightMargin=template.layout['margin_right'] * inch,
        bottomMargin=template.layout['margin_bottom'] * inch,
        leftMargin=template.layout['margin_left'] * inch
    )

    styles = getSampleStyleSheet()

    # Use template configuration for colors
    primary_color = colors.HexColor(template.colors['primary'])
    secondary_color = colors.HexColor(template.colors['secondary'])
    accent_color = colors.HexColor(template.colors['accent'])

    # Use template configuration for fonts
    main_font = template.fonts['main']
    accent_font = template.fonts['accent']

    # Custom styles
    styles.add(ParagraphStyle(
        name='InvoiceTitle',
        parent=styles['Title'],
        fontName=accent_font,
        fontSize=template.font_sizes['title'],
        textColor=primary_color,
        alignment=2,
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        name='InvoiceNumber',
        parent=styles['Normal'],
        fontName=accent_font,
        fontSize=template.font_sizes['invoice_number'],
        textColor=primary_color,
        alignment=2,
        spaceAfter=12
    ))
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Normal'],
        fontName=accent_font,
        fontSize=template.font_sizes['section_header'],
        textColor=secondary_color,
        leading=10,
        spaceBefore=10,
        spaceAfter=-10
    ))
    styles.add(ParagraphStyle(
        name='AddressText',
        parent=styles['Normal'],
        fontName=main_font,
        fontSize=template.font_sizes['normal_text'],
        leading=10,
        spaceBefore=0,
        spaceAfter=10
    ))
    styles.add(ParagraphStyle(
        name='RightAligned',
        parent=styles['Normal'],
        fontName=main_font,
        alignment=2,
        fontSize=template.font_sizes['normal_text'],
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        name='BalanceDue',
        parent=styles['Normal'],
        fontName=accent_font,
        fontSize=template.font_sizes['invoice_number'],
        textColor=colors.black,
        alignment=2,
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        name='SubItem',
        parent=styles['Normal'],
        fontName=main_font,
        fontSize=template.font_sizes['normal_text'] - 2,
        textColor=secondary_color,
        leftIndent=20
    ))
    styles.add(ParagraphStyle(
        name='PaymentTerms',
        parent=styles['Normal'],
        fontName=accent_font,
        fontSize=template.font_sizes.get('small_text', 7),
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=1
    ))

    elements = []

    # Create left column (Bill To and Send To)
    left_column = [
        [Spacer(1, 30)],
        [Paragraph("Bill To:", styles['SectionHeader'])],
        [Paragraph(invoice.bill_to.name, styles['AddressText'])],
        [Paragraph(invoice.bill_to.street_address or '', styles['AddressText'])],
        [Paragraph(f"{invoice.bill_to.city or ''}, {invoice.bill_to.state or ''} {invoice.bill_to.postal_code or ''}", styles['AddressText'])],
        [Paragraph(invoice.bill_to.phone or '', styles['AddressText'])],
        [Paragraph(invoice.bill_to.email or '', styles['AddressText'])],
        [Spacer(1, 10)],
        [Paragraph("Send To:", styles['SectionHeader'])],
        [Paragraph(invoice.send_to.name, styles['AddressText'])],
        [Paragraph(invoice.send_to.street_address or '', styles['AddressText'])],
        [Paragraph(f"{invoice.send_to.city or ''}, {invoice.send_to.state or ''} {invoice.send_to.postal_code or ''}", styles['AddressText'])],
        [Paragraph(invoice.send_to.phone or '', styles['AddressText'])],
        [Paragraph(invoice.send_to.email or '', styles['AddressText'])]
    ]

    # Create right column (Invoice details, Date, and Balance Due)
    right_column = [
        [Paragraph("INVOICE", styles['InvoiceTitle'])],
        [Paragraph(invoice.invoice_number, styles['InvoiceNumber'])],
        [Spacer(1, 20)],
        [Table([[Paragraph("Date:", styles['RightAligned']), Paragraph(invoice.invoice_date.strftime("%Y-%m-%d"), styles['RightAligned'])]], 
               colWidths=[1.5*inch, 2*inch],
               style=[('ALIGN', (0, 0), (-1, -1), 'RIGHT')])],
        [Spacer(1, 10)],
        [Table([[Paragraph("Balance Due:", styles['BalanceDue']), Paragraph(f"${invoice.total:.2f}", styles['BalanceDue'])]], 
               colWidths=[1.5*inch, 2*inch],
               style=[
                   ('BACKGROUND', (0, 0), (-1, 0), "#cccccc"),
                   ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                   ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
                   ('LEFTPADDING', (0, 0), (0, 0), 6),
                   ('RIGHTPADDING', (1, 0), (1, 0), 6),
                   ('TOPPADDING', (0, 0), (-1, 0), 2),
                   ('BOTTOMPADDING', (0, 0), (-1, 0), 7),
               ])]
    ]

    # Combine left and right columns
    header_data = [[Table(left_column, style=[('TOPPADDING', (0, 0), (-1, -1), -2)]), Table(right_column, style=[('TOPPADDING', (0, 0), (-1, -1), -3)])]]
    header_table = Table(header_data, colWidths=[3.5*inch, 3.5*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 24))

    # Items table
    table_data = [['Item', 'Quantity', 'Rate', 'Amount']]
    for item in invoice.items:
        table_data.append([
            Paragraph(item.description, styles['Normal']),
            str(item.quantity),
            f"${item.unit_price:.2f}",
            f"${item.line_total:.2f}"
        ])
        for sub_item in item.subitems:
            table_data.append([Paragraph(f"• {sub_item.description}", styles['SubItem']), '', '', ''])

    table = Table(table_data, colWidths=[4*inch, 1*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), accent_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), accent_font),
        ('FONTSIZE', (0, 0), (-1, 0), template.font_sizes['table_header']),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, 0), 1, colors.white),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, primary_color),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 24))

    # Totals
    totals_data = [
        ['', 'Subtotal:', f"${invoice.subtotal:.2f}"],
        ['', f"Discount ({invoice.discount_percentage}%):", f"${invoice.subtotal * (invoice.discount_percentage / 100):.2f}"],
        ['', f"Tax ({invoice.tax_rate}%):", f"${invoice.tax:.2f}"],
        ['', 'Total:', f"${invoice.total:.2f}"]
    ]
    totals_table = Table(totals_data, colWidths=[4*inch, 2*inch, 1*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), accent_font),
        ('LINEABOVE', (1, -1), (2, -1), 1, primary_color),
    ]))
    elements.append(totals_table)

    # Add notes if provided
    if invoice.notes:
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("Notes", styles['SectionHeader']))
        elements.append(Paragraph(invoice.notes, styles['PaymentTerms']))

    # Build the PDF
    doc.build(elements)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf