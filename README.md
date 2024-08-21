# Invoice Generator

## Description

This is a command-line invoice generator that allows you to create, manage, and customize invoices. It features template customization, PDF generation, and data persistence.

## Features

- Generate PDF invoices from command-line input
- Customize invoice templates (colors, fonts, layouts)
- Save and load invoice data in JSON format
- Regenerate invoices from saved data
- Manage multiple templates

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/invoice-generator.git
   cd invoice-generator
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Configuration

This project uses a `config.yaml` file for configuration. To set up your configuration:

1. Copy the template configuration file:
   ```
   cp config.yaml.template config.yaml
   ```

2. Edit `config.yaml` and fill in your personal information and preferences.

Note: `config.yaml` is ignored by git to prevent committing personal information. Always use `config.yaml.template` for sharing default configurations.

## Usage

### Generating an Invoice

To generate a new invoice:

```
python main.py generate-invoice --output invoice_001 --invoice-number 001 --template default
```

This will create a PDF file named `invoice_001.pdf` and a JSON file named `invoice_001.json` in the `data/invoices` directory.

### Regenerating an Invoice

To regenerate an invoice from existing JSON data:

```
python main.py regenerate-invoice --input data/invoices/invoice_001.json --output invoice_001_regenerated
```

### Managing Templates

To list available templates:

```
python main.py manage-templates --list
```

To create a new template:

```
python main.py manage-templates --create my_new_template
```

To edit an existing template:

```
python main.py manage-templates --edit existing_template
```

## Project Structure

- `main.py`: Entry point of the application
- `modules/`:
  - `cli.py`: Command-line interface implementation
  - `config_manager.py`: Configuration management
  - `data_manager.py`: Data loading and saving
  - `invoice.py`: Invoice creation and editing
  - `pdf_generator.py`: PDF generation logic
- `config.yaml.template`: Template for configuration
- `template_config.yaml`: Template configurations
- `data/invoices/`: Directory for storing generated invoices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.