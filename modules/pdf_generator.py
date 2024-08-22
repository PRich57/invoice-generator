from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, LETTER, LEGAL
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from modules.config_manager import config

PAGE_SIZES = {
    'A4': A4,
    'LETTER': LETTER,
    'LEGAL': LEGAL
}

def generate_pdf(invoice_data, output_file, template='default'):
    # Get configuration values
    output_dir = config.get('paths', 'output_directory', default='data/invoices')
    path = f"{output_dir}/{output_file}.pdf"
    
    template_config = config.get_template('templates', template, default={})
    
    page_size_str = template_config.get('layout', {}).get('page_size', 'A4')
    page_size = PAGE_SIZES.get(page_size_str.upper(), A4)
    
    margin_top = template_config.get('layout', {}).get('margin_top', 0.3)
    margin_right = template_config.get('layout', {}).get('margin_right', 0.5)
    margin_bottom = template_config.get('layout', {}).get('margin_bottom', 0.5)
    margin_left = template_config.get('layout', {}).get('margin_left', 0.5)
    
    doc = SimpleDocTemplate(path, pagesize=page_size, 
                            topMargin=margin_top*inch, 
                            rightMargin=margin_right*inch, 
                            bottomMargin=margin_bottom*inch, 
                            leftMargin=margin_left*inch)
    
    styles = getSampleStyleSheet()

    # Use template configuration for colors
    primary_color = colors.HexColor(template_config.get('colors', {}).get('primary', "#000000"))
    secondary_color = colors.HexColor(template_config.get('colors', {}).get('secondary', "#888888"))
    accent_color = colors.HexColor(template_config.get('colors', {}).get('accent', "#444444"))

    # Use template configuration for fonts
    main_font = template_config.get('fonts', {}).get('main', "Helvetica")
    accent_font = template_config.get('fonts', {}).get('accent', "Helvetica-Bold")

    # Custom styles
    styles.add(ParagraphStyle(name='InvoiceTitle', 
                              parent=styles['Title'], 
                              fontName=accent_font,
                              fontSize=template_config.get('font_sizes', {}).get('title', 28), 
                              textColor=primary_color,
                              alignment=2, 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='InvoiceNumber', 
                              parent=styles['Normal'], 
                              fontName=accent_font,
                              fontSize=template_config.get('font_sizes', {}).get('invoice_number', 20), 
                              textColor=primary_color,
                              alignment=2, 
                              spaceAfter=12))
    styles.add(ParagraphStyle(name='SectionHeader', 
                              parent=styles['Normal'], 
                              fontName=accent_font,
                              fontSize=template_config.get('font_sizes', {}).get('section_header', 10), 
                              textColor=secondary_color,
                              leading=10,
                              spaceBefore=10,
                              spaceAfter=-10))  # Reduced space after section header
    styles.add(ParagraphStyle(name='AddressText', 
                              parent=styles['Normal'], 
                              fontName=main_font,
                              fontSize=template_config.get('font_sizes', {}).get('normal_text', 11), 
                              leading=10,
                              spaceBefore=0,
                              spaceAfter=10))
    styles.add(ParagraphStyle(name='RightAligned', 
                              parent=styles['Normal'], 
                              fontName=main_font,
                              alignment=2, 
                              fontSize=template_config.get('font_sizes', {}).get('normal_text', 11), 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='BalanceDue', 
                              parent=styles['Normal'], 
                              fontName=accent_font,
                              fontSize=template_config.get('font_sizes', {}).get('invoice_number', 20), 
                              textColor=colors.black,
                              alignment=2,
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='SubItem', 
                              parent=styles['Normal'], 
                              fontName=main_font,
                              fontSize=template_config.get('font_sizes', {}).get('normal_text', 9), 
                              textColor=secondary_color,
                              leftIndent=20))
    styles.add(ParagraphStyle(name='PaymentTerms', 
                              parent=styles['Normal'], 
                              fontName=accent_font,
                              fontSize=template_config.get('font_sizes', {}).get('section_header', 10),
                              textColor=secondary_color,
                              spaceBefore=10,
                              spaceAfter=1))


    elements = []

    # Create left column (Bill To and Send To)
    left_column = [
        [Spacer(1, 30)],
        [Paragraph("Bill To:", styles['SectionHeader'])],
        [Paragraph(invoice_data['bill_to_name'], styles['AddressText'])],
        [Paragraph(invoice_data['bill_to_address1'], styles['AddressText'])],
        [Paragraph(invoice_data['bill_to_address2'], styles['AddressText'])],
        [Spacer(1, 10)],
        [Paragraph("Send To:", styles['SectionHeader'])],
        [Paragraph(invoice_data['send_to_name'], styles['AddressText'])],
        [Paragraph(invoice_data['send_to_address1'], styles['AddressText'])],
        [Paragraph(invoice_data['send_to_address2'], styles['AddressText'])]
    ]

    # Create right column (Invoice details, Date, and Balance Due)
    right_column = [
        [Paragraph("INVOICE", styles['InvoiceTitle'])],
        [Paragraph(invoice_data['invoice_number'], styles['InvoiceNumber'])],
        [Spacer(1, 20)],
        [Table([[Paragraph("Date:", styles['RightAligned']), Paragraph(invoice_data['date_of_service'], styles['RightAligned'])]], 
               colWidths=[1.5*inch, 2*inch],
               style=[('ALIGN', (0, 0), (-1, -1), 'RIGHT')])],
        [Spacer(1, 10)],
        [Table([[Paragraph("Balance Due:", styles['BalanceDue']), Paragraph(f"${invoice_data['total']:.2f}", styles['BalanceDue'])]], 
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
    for item in invoice_data['items']:
        table_data.append([
            Paragraph(item['description'], styles['Normal']),
            str(item['quantity']),
            f"${item['amount']:.2f}",
            f"${item['quantity'] * item['amount']:.2f}"
        ])
        for sub_item in item.get('sub_items', []):
            table_data.append([Paragraph(f"• {sub_item}", styles['SubItem']), '', '', ''])

    table = Table(table_data, colWidths=[4*inch, 1*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), accent_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), accent_font),
        ('FONTSIZE', (0, 0), (-1, 0), template_config.get('font_sizes', {}).get('table_header', 12)),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, 0), 1, colors.white),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, primary_color),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 24))

    # Totals
    tax_percentage = invoice_data.get('tax_percentage', 0)
    totals_data = [
        ['', 'Subtotal:', f"${invoice_data['subtotal']:.2f}"],
        ['', f"Tax ({tax_percentage}%):", f"${invoice_data['tax']:.2f}"],
        ['', 'Total:', f"${invoice_data['total']:.2f}"]
    ]
    totals_table = Table(totals_data, colWidths=[4*inch, 2*inch, 1*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), accent_font),
        ('LINEABOVE', (1, -1), (2, -1), 1, primary_color),
    ]))
    elements.append(totals_table)

    # Add payment terms
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Notes", styles['PaymentTerms']))
    elements.append(Paragraph(config.get('invoice', 'payment_terms', default=''), styles['Normal']))

    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Payment Terms:", styles['PaymentTerms']))
    elements.append(Paragraph(config.get('invoice', 'payment_terms', default=''), styles['Normal']))

    doc.build(elements)