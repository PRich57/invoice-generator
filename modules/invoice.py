from datetime import date, datetime

from modules.data_manager import load_data, get_contact_list, add_contact
from modules.config_manager import config

def get_contact_info(user_id, section_name, contact_type):
    user_data, all_user_data = load_data(user_id)
    contacts = user_data.get(contact_type, {})
    
    print(f"\n{section_name} Options:")
    print("1. Use default from config")
    print("2. Enter new information")
    print("3. Select from saved contacts")
    
    choice = safe_input("Enter your choice (1-3): ", int, choices=[1, 2, 3])
    
    if choice == 1:
        return contacts.get('B0' if contact_type == 'bill_to' else 'S0', {})
    elif choice == 2:
        new_contact = {
            'name': input(f'{section_name} (Name): '),
            'address1': input(f'{section_name} (Street Address): '),
            'address2': input(f'{section_name} (City, State, ZIP): '),
            'phone': input(f'{section_name} (Phone): '),
            'email': input(f'{section_name} (Email): ')
        }
        save_choice = safe_input("Do you want to save this contact for future use? (y/n): ", str, choices=['y', 'n'])
        if save_choice == 'y':
            new_id = add_contact(user_data, all_user_data, user_id, contact_type, new_contact)
            print(f"Contact saved with ID: {new_id}")
        return new_contact
    else:
        contact_list = get_contact_list(user_data, contact_type)
        if not contact_list:
            print("No saved contacts found. Using default.")
            return contacts.get('B0' if contact_type == 'bill_to' else 'S0', {})
        
        print("\nAvailable contacts:")
        for contact in contact_list:
            print(contact)
        
        selected_id = input("Enter the ID of the contact you want to use: ")
        return contacts.get(selected_id, contacts.get('B0' if contact_type == 'bill_to' else 'S0', {}))

def create_invoice(user_id, invoice_number):
    invoice_data = {
        'invoice_number': format_invoice_number(invoice_number),
        'bill_to': get_contact_info(user_id, 'Bill To', 'bill_to'),
        'send_to': get_contact_info(user_id, 'Send To', 'send_to'),
        'date_of_service': '',
        'items': [],
        'subtotal': 0.0,
        'tax': 0.0,
        'total': 0.0,
    }
    
    # Date of Service
    default_date = date.today().strftime('%Y-%m-%d')
    date_input = safe_input(f"Date of Sale or Service (YYYY-MM-DD) [{default_date}]: ", str, default_value=default_date)
    invoice_data['date_of_service'] = parse_date(date_input)
    
    # Items
    invoice_data['items'], invoice_data['subtotal'] = get_items()
    
    # Calculate totals
    default_tax_rate = config.get('invoice', 'tax_rate', default=0.0)
    invoice_data['tax_percentage'] = safe_input(f"Enter tax percentage [{default_tax_rate}]: ", float, default_value=default_tax_rate)
    invoice_data['total'] = calculate_totals(invoice_data['subtotal'], invoice_data['tax_percentage'])
    invoice_data['tax'] = invoice_data['total'] - invoice_data['subtotal']
    
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
        
        item = {'description': description, 'quantity': quantity, 'amount': amount, 'sub_items': []}
        
        while True:
            sub_item = input(f"Enter sub-item for '{description}' (or leave empty to finish): ")
            if not sub_item:
                break
            item['sub_items'].append(sub_item)
        
        items.append(item)
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
