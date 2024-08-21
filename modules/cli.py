import json
import click
from modules.data_manager import load_data, save_data
from modules.invoice import create_invoice, edit_invoice, format_invoice_number
from modules.pdf_generator import generate_pdf

@click.group()
def cli():
    """Invoice Generator CLI"""
    pass

@click.command()
@click.option('--output', default=None, help='Output file name (without extension).')
@click.option('--invoice-number', prompt='Invoice Number', help='Invoice number for the invoice.')
def generate_invoice(output, invoice_number):
    """Generate a PDF invoice and save data to JSON"""
    data = load_data()
    
    # Format the invoice number as '#007'
    invoice_number = format_invoice_number(invoice_number)
    
    # Create the invoice data
    invoice_data = create_invoice(data, invoice_number)
    
    # Save invoice data to JSON
    json_file_path = f"data/invoices/{output}.json"
    save_data(invoice_data, json_file_path)
    
    # Generate the PDF
    generate_pdf(invoice_data, output)
    click.echo(f"Invoice '{output}.pdf' and data saved successfully to '{json_file_path}'!")

@click.command()
@click.option('--input', prompt="Enter the JSON file path", help="Path to the JSON file to load invoice data from.")
@click.option('--output', default=None, help='Output file name (without extension).')
def regenerate_invoice(input, output):
    """Regenerate an invoice from saved JSON data"""
    invoice_data = load_invoice_from_json(input)
    
    if not output:
        output = input.split('/')[-1].split('.')[0]  # Use the input filename without extension
    
    # Generate the PDF
    generate_pdf(invoice_data, output)
    click.echo(f"Invoice '{output}.pdf' regenerated successfully!")

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

if __name__ == '__main__':
    cli()