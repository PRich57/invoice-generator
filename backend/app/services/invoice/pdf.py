from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.exceptions import (ContactNotFoundException,
                                InvoiceNotFoundException,
                                TemplateNotFoundException)
from ...models.invoice import Invoice, InvoiceItem, InvoiceSubItem
from ...models.template import Template
from ...schemas.invoice import InvoiceCreate
from ..contact import crud as crud_contact
from .crud import get_invoice


def generate_pdf(invoice: Invoice, template: Template) -> bytes:
    invoice_number = invoice.invoice_number
    invoice_date = invoice.invoice_date
    bill_to = invoice.bill_to
    send_to = invoice.send_to
    items = invoice.items
    subtotal = invoice.subtotal
    discount_percentage = invoice.discount_percentage
    discount_amount = invoice.discount_amount
    discounted_subtotal = invoice.discounted_subtotal
    tax = invoice.tax
    total = invoice.total
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
    
    formatted_date = invoice_date.strftime('%B %d, %Y') if invoice_date else ''

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
        spaceAfter=2
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
        spaceAfter=2
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
        name='ItemDescription',
        parent=styles['Normal'],
        fontName=main_font,
        fontSize=template.font_sizes['normal_text'],
        textColor=primary_color,
    ))
    styles.add(ParagraphStyle(
        name='SubItemDescription',
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
        [Paragraph(bill_to.name, styles['AddressText'])],
        [Paragraph(bill_to.street_address or '', styles['AddressText'])],
        [Paragraph(f"{bill_to.city or ''} {bill_to.state or ''} {bill_to.postal_code or ''}", styles['AddressText'])],
        [Spacer(1, 10)],
        [Paragraph("Send To:", styles['SectionHeader'])],
        [Paragraph(send_to.name, styles['AddressText'])],
        [Paragraph(send_to.street_address or '', styles['AddressText'])],
        [Paragraph(f"{send_to.city or ''} {send_to.state or ''} {send_to.postal_code or ''}", styles['AddressText'])],
    ]

    # Create right column (Invoice details, Date, and Balance Due)
    right_column = [
        [Paragraph("INVOICE", styles['InvoiceTitle'])],
        [Paragraph(f"#{invoice_number}", styles['InvoiceNumber'])],
        [Spacer(1, 20)],
        [Table([[Paragraph("Date:", styles['RightAligned']), Paragraph(formatted_date, styles['RightAligned'])]], 
               colWidths=[1.5*inch, 1.75*inch],
               style=[('ALIGN', (0, 0), (-1, -1), 'RIGHT')])],
        [Spacer(1, 10)],
        [Table([[Paragraph("Balance Due:", styles['BalanceDue']), Paragraph(f"${total:.2f}", styles['BalanceDue'])]], 
               colWidths=[1.5*inch, 1.75*inch],
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
    items_data = [['Item', 'Unit Price', 'Quantity', 'Total']]
    for item in items:
        description = item.description
        if item.discount_percentage > 0:
            description += f" ({item.discount_percentage}% Discount)"
        items_data.append([
            Paragraph(description, styles['ItemDescription']),
            f"${item.unit_price:.2f}",
            str(item.quantity),
            f"${item.line_total:.2f}"
        ])
        # Add subitems
        for subitem in item.subitems:
            items_data.append([
                Paragraph(f"• {subitem.description}", styles['SubItemDescription']),
                '', '', ''
            ])
            
    col_widths = [4*inch, 1*inch, 1*inch, 1*inch]
    items_table = Table(items_data, colWidths=col_widths)
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), accent_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), accent_font),
        ('FONTSIZE', (0, 0), (-1, 0), template.font_sizes['table_header']),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, 0), 1, colors.white),
        ('LINEBELOW', (0, -1), (-1, -1), 0.5, primary_color),
        ('TOPPADDING', (0, 1), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 1),
    ]))

    elements.append(items_table)
    elements.append(Spacer(1, 12))

    # Totals
    totals_data = [
        ['', 'Subtotal:', f"${subtotal:.2f}"],
    ]
    
    if discount_percentage > 0:
        totals_data.extend([
            ['', f"Discount ({discount_percentage}%):", f"-${discount_amount:.2f}"],
            ['', 'Discounted Subtotal:', f"${discounted_subtotal:.2f}"],
        ])
    
    totals_data.extend([
        ['', f"Tax ({invoice.tax_rate}%):", f"${tax:.2f}"],
        ['', 'Total:', f"${total:.2f}"]
    ])
    
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


async def generate_preview_pdf(
    db: AsyncSession,
    invoice_data: InvoiceCreate,
    template: Template,
    user_id: int,
) -> bytes:
    # Retrieve contacts
    bill_to_contact = await crud_contact.get_contact(db, invoice_data.bill_to_id, user_id)
    send_to_contact = await crud_contact.get_contact(db, invoice_data.send_to_id, user_id)
    
    if not bill_to_contact or not send_to_contact:
        raise ContactNotFoundException()
    
    # Create Invoice ORM instance
    temp_invoice = Invoice(
        user_id=0,
        invoice_number=invoice_data.invoice_number,
        invoice_date=invoice_data.invoice_date,
        tax_rate=invoice_data.tax_rate or 0,
        discount_percentage=invoice_data.discount_percentage or 0,
        notes=invoice_data.notes,
        template_id=invoice_data.template_id,
        bill_to_id=invoice_data.bill_to_id,
        send_to_id=invoice_data.send_to_id,
    )
    
    # Assign contacts directly
    temp_invoice.bill_to = bill_to_contact
    temp_invoice.send_to = send_to_contact
    
    # Create InvoiceItem ORM instances
    temp_items = []
    for item_data in invoice_data.items:
        temp_item = InvoiceItem(
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount_percentage=item_data.discount_percentage or 0,
        )
        # Create InvoiceSubItem ORM instances if any
        temp_subitems = []
        if item_data.subitems:
            for subitem_data in item_data.subitems:
                temp_subitem = InvoiceSubItem(
                    description=subitem_data.description,
                )
                temp_subitems.append(temp_subitem)
            temp_item.subitems = temp_subitems
        temp_items.append(temp_item)
    temp_invoice.items = temp_items

    # Calculate totals using the ORM method
    temp_invoice.calculate_totals()
    
    # Pass the ORM model directly to the PDF generation function
    pdf_content = generate_pdf(temp_invoice, template)
    return pdf_content


async def generate_invoice_pdf(db: AsyncSession, invoice_id: int, template_id: int, user_id: int) -> bytes:
    invoice = await get_invoice(db, invoice_id, user_id)
    if not invoice:
        raise InvoiceNotFoundException()
    
    stmt = select(Template).filter(Template.id == template_id)
    result = await db.execute(stmt)
    template = result.scalar_one_or_none()
    if not template:
        raise TemplateNotFoundException()
    
    return generate_pdf(invoice, template)