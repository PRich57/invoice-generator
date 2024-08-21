import click
import yaml
import json
from modules.data_manager import load_data, save_data
from modules.invoice import create_invoice, edit_invoice, format_invoice_number
from modules.pdf_generator import generate_pdf
from modules.config_manager import ConfigManager

@click.group()
def cli():
    """Invoice Generator CLI"""
    pass

@click.command()
@click.option('--output', default=None, help='Output file name (without extension).')
@click.option('--invoice-number', prompt='Invoice Number', help='Invoice number for the invoice.')
@click.option('--template', default='default', help='Template to use for the invoice.')
def generate_invoice(output, invoice_number, template):
    """Generate a PDF invoice and save data to JSON"""
    config_manager = ConfigManager()
    templates = config_manager.get_template('templates', default={})
    
    if template not in templates:
        click.echo(f"Template '{template}' not found. Using default template.")
        template = 'default'
    
    data = load_data()
    
    # Format the invoice number as '#007'
    invoice_number = format_invoice_number(invoice_number)
    
    # Create the invoice data
    invoice_data = create_invoice(data, invoice_number)
    
    # Save invoice data to JSON
    json_file_path = f"data/invoices/{output}.json"
    save_data(invoice_data, json_file_path)
    
    # Generate the PDF
    generate_pdf(invoice_data, output, template)
    click.echo(f"Invoice '{output}.pdf' and data saved successfully!")

@click.command()
@click.option('--input', prompt="Enter the JSON file path", help="Path to the JSON file to load invoice data from.")
@click.option('--output', default=None, help='Output file name (without extension).')
@click.option('--template', default='default', help='Template to use for the invoice.')
def regenerate_invoice(input, output, template):
    """Regenerate an invoice from saved JSON data"""
    config_manager = ConfigManager()
    templates = config_manager.get_template('templates', default={})
    
    if template not in templates:
        click.echo(f"Template '{template}' not found. Using default template.")
        template = 'default'
    
    invoice_data = load_invoice_from_json(input)
    
    if not output:
        output = input.split('/')[-1].split('.')[0]  # Use the input filename without extension
    
    # Generate the PDF
    generate_pdf(invoice_data, output, template)
    click.echo(f"Invoice '{output}.pdf' regenerated successfully!")

@click.command()
@click.option('--list', 'list_templates', is_flag=True, help='List available templates')
@click.option('--create', help='Create a new template')
@click.option('--edit', help='Edit an existing template')
def manage_templates(list_templates, create, edit):
    """Manage invoice templates"""
    config_manager = ConfigManager()
    
    if list_templates:
        templates = config_manager.get_template('templates', default={})
        click.echo("Available templates:")
        for name, _ in templates.items():
            click.echo(f"- {name}")
    
    elif create:
        new_template = {
            'colors': {
                'primary': click.prompt('Primary color (hex)', default='#000000'),
                'secondary': click.prompt('Secondary color (hex)', default='#888888'),
                'accent': click.prompt('Accent color (hex)', default='#4A86E8'),
            },
            'fonts': {
                'main': click.prompt('Main font', default='Helvetica'),
                'accent': click.prompt('Accent font', default='Helvetica-Bold'),
            },
            'font_sizes': {
                'title': click.prompt('Title font size', type=int, default=20),
                'invoice_number': click.prompt('Invoice number font size', type=int, default=14),
                'section_header': click.prompt('Section header font size', type=int, default=10),
                'normal_text': click.prompt('Normal text font size', type=int, default=9),
            },
            'layout': {
                'page_size': click.prompt('Page size', default='A4'),
                'margin_top': click.prompt('Top margin', type=float, default=0.3),
                'margin_right': click.prompt('Right margin', type=float, default=0.5),
                'margin_bottom': click.prompt('Bottom margin', type=float, default=0.5),
                'margin_left': click.prompt('Left margin', type=float, default=0.5),
            },
        }
        
        templates = config_manager.get_template('templates', default={})
        templates[create] = new_template
        
        with open(config_manager.template_config_path, 'w') as f:
            yaml.dump({'templates': templates}, f)
        
        click.echo(f"Template '{create}' created successfully.")
    
    elif edit:
        templates = config_manager.get_template('templates', default={})
        if edit not in templates:
            click.echo(f"Template '{edit}' not found.")
            return
        
        template = templates[edit]
        template['colors']['primary'] = click.prompt('Primary color (hex)', default=template['colors']['primary'])
        template['colors']['secondary'] = click.prompt('Secondary color (hex)', default=template['colors']['secondary'])
        template['colors']['accent'] = click.prompt('Accent color (hex)', default=template['colors']['accent'])
        template['fonts']['main'] = click.prompt('Main font', default=template['fonts']['main'])
        template['fonts']['accent'] = click.prompt('Accent font', default=template['fonts']['accent'])
        template['font_sizes']['title'] = click.prompt('Title font size', type=int, default=template['font_sizes']['title'])
        template['font_sizes']['invoice_number'] = click.prompt('Invoice number font size', type=int, default=template['font_sizes']['invoice_number'])
        template['font_sizes']['section_header'] = click.prompt('Section header font size', type=int, default=template['font_sizes']['section_header'])
        template['font_sizes']['normal_text'] = click.prompt('Normal text font size', type=int, default=template['font_sizes']['normal_text'])
        template['layout']['page_size'] = click.prompt('Page size', default=template['layout']['page_size'])
        template['layout']['margin_top'] = click.prompt('Top margin', type=float, default=template['layout']['margin_top'])
        template['layout']['margin_right'] = click.prompt('Right margin', type=float, default=template['layout']['margin_right'])
        template['layout']['margin_bottom'] = click.prompt('Bottom margin', type=float, default=template['layout']['margin_bottom'])
        template['layout']['margin_left'] = click.prompt('Left margin', type=float, default=template['layout']['margin_left'])
        
        with open(config_manager.template_config_path, 'w') as f:
            yaml.dump({'templates': templates}, f)
        
        click.echo(f"Template '{edit}' updated successfully.")

def load_invoice_from_json(file_path):
    """Load invoice data from a JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        click.echo(f"Error: File '{file_path}' not found.")
        exit(1)
    except json.JSONDecodeError:
        click.echo(f"Error: Invalid JSON in file '{file_path}'.")
        exit(1)

cli.add_command(generate_invoice)
cli.add_command(regenerate_invoice)
cli.add_command(manage_templates)

if __name__ == '__main__':
    cli()