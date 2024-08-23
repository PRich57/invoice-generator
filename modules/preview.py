import webbrowser
from tempfile import NamedTemporaryFile

from jinja2 import Template

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

            .header-container {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .invoice-header {
                text-align: right;
            }

            .invoice-title {
                font-size: 24px;
                color: {{ template_config['colors']['primary'] }};
            }

            .invoice-number {
                font-size: 18px;
                color: {{ template_config['colors']['primary'] }};
            }

            .detail-item {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-bottom: 5px;
                padding: 0 10px;
            }

            .label {
                min-width: 150px;
                text-align: right;
                margin-right: 20px;
            }

            .value {
                text-align: right;
                flex-grow: 1;
            }
            
            .balance-due {
                background-color: #888888;
            }

            .balance-due .label {
                font-weight: bold;
                font-size: 20px;
            }
            
            .balance-due .value {
                font-weight: bold;
                font-size: 20px;
            }

            .section-header {
                font-size: 14px;
                font-weight: bold;
                color: {{ template_config['colors']['secondary'] }};
            }

            .section-content {
                font-size: 16px;
                margin-bottom: 10px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }

            th,
            td {
                border: 0px solid {{ template_config['colors']['secondary'] }};
                padding: 10px;
                text-align: left;
            }

            th {
                background-color: {{ template_config['colors']['accent'] }};
                color: white;
            }

            .totals {
                margin-top: 20px;
                width: 100%;
            }

            .totals table {
                width: 40%;
                margin-left: auto;
            }

            .totals td {
                text-align: right;
            }

            .totals td:first-child {
                text-align: left;
            }

            .payment-terms {
                margin-top: 20px;
                font-size: 14px;
                font-weight: bold;
                color: {{ template_config['colors']['secondary'] }};
            }
        </style>
    </head>

    <body>
        <div class="header-container">
            <div>
                <br>
                <div class="section-header">Bill To:</div>
                <div class="section-content">
                    {{ invoice_data['bill_to_name'] }}<br>
                    {{ invoice_data['bill_to_address1'] }}<br>
                    {{ invoice_data['bill_to_address2'] }}
                </div>

                <br>
                <div class="section-header">Send To:</div>
                <div class="section-content">
                    {{ invoice_data['send_to_name'] }}<br>
                    {{ invoice_data['send_to_address1'] }}<br>
                    {{ invoice_data['send_to_address2'] }}
                </div>
            </div>

            <div class="invoice-header">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number">#{{ invoice_data['invoice_number'] }}</div>
                <br>
                <div class="detail-item date-due">
                    <div class="label">Date:</div>
                    <div class="value">{{ invoice_data['date_of_service'] }}</div>
                </div>
                
                <div class="detail-item balance-due">
                    <div class="label">Balance Due:</div>
                    <div class="value">${{ "%.2f"|format(invoice_data['total']) }}</div>
                </div>
            </div>
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
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td>${{ "%.2f"|format(invoice_data['subtotal']) }}</td>
                </tr>
                <tr>
                    <td>Tax ({{ invoice_data['tax_percentage'] }}%):</td>
                    <td>${{ "%.2f"|format(invoice_data['tax']) }}</td>
                </tr>
                <tr class="total">
                    <td>Total:</td>
                    <td>${{ "%.2f"|format(invoice_data['total']) }}</td>
                </tr>
            </table>
        </div>

        <br>
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