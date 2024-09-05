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

```
invoice-generator
├─ .gitignore
├─ backend
│  ├─ alembic
│  │  ├─ env.py
│  │  ├─ README
│  │  ├─ script.py.mako
│  │  └─ versions
│  │     ├─ 1fd36f9317f5_add_is_default_to_templates_and_make_.py
│  │     ├─ 2d4e531014b3_initial_migration.py
│  │     ├─ 4d31b27537b2_add_me_endpoint.py
│  │     ├─ 4d9c37022733_.py
│  │     ├─ 4ddec9156356_update_contact_model.py
│  │     ├─ 58bb598e9c85_refactored_subtotal_total_and_line_.py
│  │     ├─ 59c62398c16d_add_user_relationships.py
│  │     ├─ 5e191049df07_add_invoice_and_invoice_item_tables.py
│  │     ├─ 604ad56f3048_enhance_logging_and_exception_handling_.py
│  │     ├─ 62844d2b43e6_.py
│  │     ├─ 645f9b338151_add_user_relationships.py
│  │     ├─ 6480cea734f7_provide_option_for_none_in_template_.py
│  │     ├─ 85f3bd0b1a5a_update_invoice_and_template_schemas_.py
│  │     ├─ 8778965f9003_update_contact_model_for_optional_fields.py
│  │     ├─ 88ea364e42bb_updated_invoice_naming_conventions_for_.py
│  │     ├─ 898df5e68e74_add_template_id_to_invoices.py
│  │     ├─ 8cc8395739e1_update_models_and_schema_to_allow_.py
│  │     ├─ 9002a1f708f1_add_is_default_and_user_id_to_templates_.py
│  │     ├─ 94dcc77fa39f_update_invoice_model_with_notes_field.py
│  │     ├─ 98dc8ccc3ff0_enhance_logging_and_exception_handling_.py
│  │     ├─ ac95495a34fb_update_contact_model_with_nullable_.py
│  │     ├─ af2a8445e9b0_add_subitems_and_update_template_model.py
│  │     ├─ bbf283e35831_add_user_relationships.py
│  │     ├─ bcd9b16bcdb3_update_contact_model_with_validation_.py
│  │     ├─ c60a936123ca_make_template_id_nullable_in_invoices_.py
│  │     ├─ e628c8b8733a_update_contact_model_for_optional_fields.py
│  │     ├─ e76457fa71c2_update_models_and_schema_to_allow_.py
│  │     ├─ f48d4c4035a4_refactor_backend_pdf_generation_to_.py
│  │     └─ ffd58baebfb1_refactor_backend_pdf_generation_to_.py
│  ├─ alembic.ini
│  ├─ app
│  │  ├─ api
│  │  │  ├─ auth.py
│  │  │  ├─ contacts.py
│  │  │  ├─ templates.py
│  │  │  └─ __init__.py
│  │  ├─ core
│  │  │  ├─ config.py
│  │  │  ├─ deps.py
│  │  │  ├─ exceptions.py
│  │  │  └─ security.py
│  │  ├─ database.py
│  │  ├─ main.py
│  │  ├─ models
│  │  │  ├─ contact.py
│  │  │  ├─ invoice.py
│  │  │  ├─ template.py
│  │  │  ├─ user.py
│  │  │  └─ __init__.py
│  │  ├─ schemas
│  │  │  ├─ contact.py
│  │  │  ├─ invoice.py
│  │  │  ├─ template.py
│  │  │  ├─ user.py
│  │  │  └─ __init__.py
│  │  ├─ services
│  │  │  ├─ contact_service.py
│  │  │  ├─ invoice_service.py
│  │  │  ├─ pdf_service.py
│  │  │  ├─ template_service.py
│  │  │  └─ user_service.py
│  │  └─ __init__.py
│  └─ requirements.txt
├─ data
├─ frontend
│  ├─ package.json
│  ├─ public
│  │  └─ index.html
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  └─ common
│  │  │     ├─ ConfirmationDialogue.tsx
│  │  │     ├─ ErrorMessage.tsx
│  │  │     └─ LoadingSpinner.tsx
│  │  ├─ constants
│  │  │  ├─ apiEndpoints.ts
│  │  │  └─ routes.ts
│  │  ├─ contexts
│  │  │  └─ AuthContext.tsx
│  │  ├─ hooks
│  │  │  ├─ useAuth.ts
│  │  │  ├─ useContacts.ts
│  │  │  ├─ useErrorHandler.ts
│  │  │  └─ useFetch.ts
│  │  ├─ index.tsx
│  │  ├─ layouts
│  │  │  └─ MainLayout.tsx
│  │  ├─ pages
│  │  │  ├─ ContactForm.tsx
│  │  │  ├─ ContactsList.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ InvoiceForm.tsx
│  │  │  ├─ InvoicesList.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Register.tsx
│  │  │  ├─ TemplateForm.tsx
│  │  │  └─ TemplatesList.tsx
│  │  ├─ services
│  │  │  └─ api.ts
│  │  ├─ styles
│  │  │  └─ theme.ts
│  │  ├─ types
│  │  │  └─ index.ts
│  │  ├─ utils
│  │  │  ├─ currencyFormatter.ts
│  │  │  ├─ dateFormatter.ts
│  │  │  └─ validationHelpers.ts
│  │  └─ validationSchemas
│  │     └─ invoiceValidationSchema.ts
│  ├─ tsconfig.json
│  └─ webpack.config.js
├─ main.py
├─ modules
│  ├─ cli.py
│  ├─ config_manager.py
│  ├─ data_manager.py
│  ├─ invoice.py
│  ├─ pdf_generator.py
│  ├─ preview.py
│  └─ __init__.py
├─ README.md
├─ requirements.txt
└─ tests
   ├─ test_cli.py
   ├─ test_data_manager.py
   ├─ test_invoice.py
   ├─ test_pdf_generator.py
   ├─ test_preview.py
   └─ __init__.py

```