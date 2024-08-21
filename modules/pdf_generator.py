from reportlab.lib.pagesizes import A4, LETTER, LEGAL
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from modules.config_manager import config

# Define a dictionary to map string values to ReportLab page sizes
PAGE_SIZES = {
    'A4': A4,
    'LETTER': LETTER,
    'LEGAL': LEGAL
}

def generate_pdf(invoice_data, output_file):
    # Get configuration values
    output_dir = config.get('paths', 'output_directory', default='data/invoices')
    path = f"{output_dir}/{output_file}.pdf"
    
    page_size_str = config.get('layout', 'page_size', default='A4')
    page_size = PAGE_SIZES.get(page_size_str.upper(), A4)  # Default to A4 if not found
    
    margin_top = config.get('layout', 'margin_top', default=0.3)
    margin_right = config.get('layout', 'margin_right', default=0.5)
    margin_bottom = config.get('layout', 'margin_bottom', default=0.5)
    margin_left = config.get('layout', 'margin_left', default=0.5)
    
    doc = SimpleDocTemplate(path, pagesize=page_size, 
                            topMargin=margin_top*inch, 
                            rightMargin=margin_right*inch, 
                            bottomMargin=margin_bottom*inch, 
                            leftMargin=margin_left*inch)
    
    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(name='InvoiceTitle', 
                              parent=styles['Title'], 
                              fontSize=config.get('styling', 'font_sizes', 'title', default=20), 
                              alignment=2, 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='InvoiceNumber', 
                              parent=styles['Normal'], 
                              fontSize=config.get('styling', 'font_sizes', 'invoice_number', default=14), 
                              textColor=colors.gray,
                              alignment=2, 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='SectionHeader', 
                              parent=styles['Normal'], 
                              fontSize=config.get('styling', 'font_sizes', 'section_header', default=10), 
                              fontName='Helvetica-Bold',
                              spaceAfter=1))
    styles.add(ParagraphStyle(name='AddressText', 
                              parent=styles['Normal'], 
                              fontSize=config.get('styling', 'font_sizes', 'normal_text', default=9), 
                              leading=10, 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='RightAligned', 
                              parent=styles['Normal'], 
                              alignment=2, 
                              fontSize=config.get('styling', 'font_sizes', 'normal_text', default=9), 
                              spaceAfter=0))
    styles.add(ParagraphStyle(name='SubItem', 
                              parent=styles['Normal'], 
                              fontSize=config.get('styling', 'font_sizes', 'normal_text', default=9), 
                              textColor=colors.gray,
                              leftIndent=20))

    elements = []

    # Create a table for the header section
    header_data = [
        [Paragraph("", styles['SectionHeader']), Paragraph("INVOICE", styles['InvoiceTitle'])],
        ["", Paragraph(invoice_data['invoice_number'], styles['InvoiceNumber'])],
        ["", ""],  # Empty row for spacing
        [Paragraph("Bill To:", styles['SectionHeader']), Paragraph(invoice_data['date_of_service'], styles['RightAligned'])],
        [Paragraph(invoice_data['bill_to_name'], styles['AddressText']), Paragraph(f"Balance Due: {config.get('invoice', 'currency', default='$')}{invoice_data['total']:.2f}", styles['RightAligned'])],
        [Paragraph(invoice_data['bill_to_address1'], styles['AddressText']), ""],
        [Paragraph(invoice_data['bill_to_address2'], styles['AddressText']), ""],
        [Paragraph("Send To:", styles['SectionHeader']), ""],
        [Paragraph(invoice_data['send_to_name'], styles['AddressText']), ""],
        [Paragraph(invoice_data['send_to_address1'], styles['AddressText']), ""],
        [Paragraph(invoice_data['send_to_address2'], styles['AddressText']), ""]
    ]

    header_table = Table(header_data, colWidths=[3*inch, 4*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 2), (-1, 2), 8),  # Add space between invoice number and date
        ('TOPPADDING', (0, 3), (-1, 3), 4),  # Adjust space above "Bill To:"
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 12))

    # Items table
    table_data = [['Item', 'Quantity', 'Rate', 'Amount']]
    for item in invoice_data['items']:
        table_data.append([
            Paragraph(item['description'], styles['Normal']),
            str(item['quantity']),
            f"{config.get('invoice', 'currency', default='$')}{item['amount']:.2f}",
            f"{config.get('invoice', 'currency', default='$')}{item['quantity'] * item['amount']:.2f}"
        ])
        for sub_item in item.get('sub_items', []):
            table_data.append([Paragraph(f"• {sub_item}", styles['SubItem']), '', '', ''])

    table = Table(table_data, colWidths=[4*inch, 1*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, 0), 1, colors.black),
        ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 12))

    # Totals
    totals_data = [
        ['Subtotal:', f"{config.get('invoice', 'currency', default='$')}{invoice_data['subtotal']:.2f}"],
        ['Tax:', f"{config.get('invoice', 'currency', default='$')}{invoice_data['tax']:.2f}"],
        ['Total:', f"{config.get('invoice', 'currency', default='$')}{invoice_data['total']:.2f}"]
    ]
    totals_table = Table(totals_data, colWidths=[6*inch, 1*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(totals_table)

    # Add payment terms
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(config.get('invoice', 'payment_terms', default='Payable by Check or Zelle'), styles['Normal']))

    doc.build(elements)