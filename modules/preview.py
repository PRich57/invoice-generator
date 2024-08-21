import webbrowser
from jinja2 import Template
from tempfile import NamedTemporaryFile
from modules.config_manager import config

def preview_invoice(invoice_data, template_name):
    """Generate an HTML preview of the invoice"""
    template_config = config.get_template('templates', template_name, default={})
    
    html_template = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice Preview</title>
        <style>
            body {
                font-family: {{ template_config['fonts']['main'] }}, sans-serif;
                color: {{ template_config['colors']['primary'] }};
                line-height: 1.6;
                padding: 20px;
            }
            .invoice-header {
                text-align: right;
            }
            .invoice-title {
                font-size: {{ template_config['font_sizes']['title'] }}px;
                color: {{ template_config['colors']['primary'] }};
            }
            .invoice-number {
                font-size: {{ template_config['font_sizes']['invoice_number'] }}px;
                color: {{ template_config['colors']['primary'] }};
            }
            .section-header {
                font-size: 8px;
                font-weight: bold;
                color: {{ template_config['colors']['secondary'] }};
            }
            .section-content {
                font-size: {{ template_config['font_sizes']['normal_text'] }}px;
                margin-bottom: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th, td {
                border: 1px solid {{ template_config['colors']['secondary'] }};
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: {{ template_config['colors']['accent'] }};
                color: white;
            }
            .totals {
                margin-top: 20px;
            }
            .totals div {
                display: flex;
                justify-content: space-between;
            }
            .total {
                font-weight: bold;
            }
            .payment-terms {
                margin-top: 20px;
                font-size: 8px;
                font-weight: bold;
                color: {{ template_config['colors']['secondary'] }};
            }
        </style>
    </head>
    <body>
        <div class="invoice-header">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">{{ invoice_data['invoice_number'] }}</div>
            <div>{{ invoice_data['date_of_service'] }}</div>
            <div>Balance Due: ${{ "%.2f"|format(invoice_data['total']) }}</div>
        </div>
        
        <div class="section-header">Bill To:</div>
        <div class="section-content">
            {{ invoice_data['bill_to_name'] }}<br>
            {{ invoice_data['bill_to_address1'] }}<br>
            {{ invoice_data['bill_to_address2'] }}
        </div>
        
        <div class="section-header">Send To:</div>
        <div class="section-content">
            {{ invoice_data['send_to_name'] }}<br>
            {{ invoice_data['send_to_address1'] }}<br>
            {{ invoice_data['send_to_address2'] }}
        </div>
        
        <table>
            <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
            </tr>
            {% for item in invoice_data['items'] %}
            <tr>
                <td>{{ item['description'] }}</td>
                <td>{{ item['quantity'] }}</td>
                <td>${{ "%.2f"|format(item['amount']) }}</td>
                <td>${{ "%.2f"|format(item['quantity'] * item['amount']) }}</td>
            </tr>
            {% endfor %}
        </table>
        
        <div class="totals">
            <div><span>Subtotal:</span> <span>${{ "%.2f"|format(invoice_data['subtotal']) }}</span></div>
            <div><span>Tax:</span> <span>${{ "%.2f"|format(invoice_data['tax']) }}</span></div>
            <div class="total"><span>Total:</span> <span>${{ "%.2f"|format(invoice_data['total']) }}</span></div>
        </div>
        
        <div class="payment-terms">Payment Terms:</div>
        <div>{{ invoice_data.get('payment_terms', '') }}</div>
    </body>
    </html>
    """
    
    template = Template(html_template)
    rendered_html = template.render(invoice_data=invoice_data, template_config=template_config)
    
    with NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
        f.write(rendered_html)
        webbrowser.open('file://' + f.name)

    print(f"Preview generated. Please check your web browser.")