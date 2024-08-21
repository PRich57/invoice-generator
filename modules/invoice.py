from datetime import date, datetime

def get_contact_info(data, section_name, id_type, data_key):
    use_saved = safe_input(f"Would you like to use a saved {section_name} contact? (y/n): ", str, choices=['y', 'n']) == 'y'
    
    if use_saved:
        contact_id = input(f"Enter the {id_type} ID for the {section_name}: ")
        if data_key not in data:
            print(f"No saved {data_key} found. Please enter the details manually.")
            use_saved = False
        elif contact_id not in data[data_key]:
            print(f"No saved contact found with ID {contact_id}. Please enter the details manually.")
            use_saved = False
        else:
            contact = data[data_key][contact_id]
            return contact['name'], contact.get('address1', ''), contact.get('address2', '')
    
    if not use_saved:
        name = input(f'{section_name} (Name): ')
        address1 = input(f'{section_name} (Street Address): ')
        address2 = input(f'{section_name} (City, State, ZIP): ')
        return name, address1, address2

def create_invoice(data, invoice_number):
    print("Loaded data:", data)  # Add this line to print the loaded data
    invoice_data = {
        'invoice_number': format_invoice_number(invoice_number),
        'bill_to_name': '',
        'bill_to_address1': '',
        'bill_to_address2': '',
        'send_to_name': '',
        'send_to_address1': '',
        'send_to_address2': '',
        'date_of_service': '',
        'items': [],
        'subtotal': 0.0,
        'tax': 0.0,
        'total': 0.0,
    }
    
    # Fill in invoice details
    invoice_data['bill_to_name'], invoice_data['bill_to_address1'], invoice_data['bill_to_address2'] = get_contact_info(data, 'Bill To', 'company', 'companies')
    invoice_data['send_to_name'], invoice_data['send_to_address1'], invoice_data['send_to_address2'] = get_contact_info(data, 'Send To', 'employee', 'employees')
    
    # Date of Service
    invoice_data['date_of_service'] = safe_input("Date of Sale or Service (YYYY-MM-DD, leave blank for today): ", parse_date, default_value=date.today().strftime('%B %d, %Y'))
    
    # Items
    invoice_data['items'], invoice_data['subtotal'] = get_items()
    
    # Calculate totals
    invoice_data['tax'] = safe_input("Enter tax percentage (default is 0): ", float, default_value=0)
    invoice_data['total'] = calculate_totals(invoice_data['subtotal'], invoice_data['tax'])
    
    return invoice_data

def get_items():
    items = []
    subtotal = 0.0
    
    while True:
        description = input("Enter item description (or leave empty to finish): ")
        if not description:
            break
        
        quantity = safe_input(f"Enter quantity for '{description}': ", int)
        amount = safe_input(f"Enter amount for '{description}': ", float)
        
        sub_items = []
        while True:
            sub_item = input(f"Enter sub-item for '{description}' (or leave empty to finish): ")
            if not sub_item:
                break
            sub_items.append(sub_item)
        
        items.append({'description': description, 'quantity': quantity, 'amount': amount, 'sub_items': sub_items})
        subtotal += quantity * amount
    
    return items, subtotal

def calculate_totals(subtotal, tax_percentage):
    tax = subtotal * (tax_percentage / 100)
    total = subtotal + tax
    return total

def format_invoice_number(number):
    number = str(number).lstrip('#')
    return f"#{int(number):03d}"

def safe_input(prompt, expected_type, default_value=None, choices=None):
    while True:
        try:
            value = input(prompt)
            if not value and default_value is not None:
                return default_value
            if choices and value.lower() not in choices:
                raise ValueError(f"Please enter one of the following: {choices}")
            return expected_type(value)
        except ValueError as e:
            print(f"Invalid input: {e}. Please try again.")

def parse_date(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d').strftime('%B %d, %Y')

def edit_invoice(invoice_data):
    return invoice_data
