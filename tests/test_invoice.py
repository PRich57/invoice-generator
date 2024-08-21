import os
import sys
import unittest
from unittest.mock import MagicMock, patch

from modules.invoice import (calculate_totals, create_invoice,
                             format_invoice_number, get_contact_info,
                             get_items, parse_date, safe_input)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestInvoice(unittest.TestCase):

    def setUp(self):
        self.sample_data = {
            'companies': {'1': {'name': 'Test Company', 'address1': '123 Test St', 'address2': 'Test City, TS 12345'}},
            'employees': {'1': {'name': 'John Doe', 'address1': '456 Employee St', 'address2': 'Work City, WC 67890'}}
        }

    @patch('modules.invoice.get_contact_info')
    @patch('modules.invoice.get_items')
    @patch('modules.invoice.safe_input')
    def test_create_invoice(self, mock_safe_input, mock_get_items, mock_get_contact_info):
        mock_get_contact_info.side_effect = [
            ('Test Company', '123 Test St', 'Test City, TS 12345'),
            ('John Doe', '456 Employee St', 'Work City, WC 67890')
        ]
        mock_get_items.return_value = ([], 0.0)
        mock_safe_input.side_effect = ['2024-08-21', 10.0]

        result = create_invoice(self.sample_data, '#001')

        self.assertEqual(result['invoice_number'], '#001')
        self.assertEqual(result['bill_to_name'], 'Test Company')
        self.assertEqual(result['send_to_name'], 'John Doe')
        self.assertEqual(result['date_of_service'], 'August 21, 2024')
        self.assertEqual(result['subtotal'], 0.0)
        self.assertEqual(result['tax'], 10.0)
        self.assertEqual(result['total'], 0.0)

    @patch('builtins.input')
    def test_get_contact_info(self, mock_input):
        mock_input.side_effect = ['y', '1']
        result = get_contact_info(self.sample_data, 'Bill To', 'company', 'companies')
        self.assertEqual(result, ('Test Company', '123 Test St', 'Test City, TS 12345'))

        mock_input.side_effect = ['n', 'New Company', 'New Address', 'New City, NC 54321']
        result = get_contact_info(self.sample_data, 'Bill To', 'company', 'companies')
        self.assertEqual(result, ('New Company', 'New Address', 'New City, NC 54321'))

    @patch('builtins.input')
    def test_get_items(self, mock_input):
        mock_input.side_effect = ['Item 1', '2', '10.00', 'Sub-item 1', '', 'Item 2', '1', '25.00', '', '']
        items, subtotal = get_items()
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['description'], 'Item 1')
        self.assertEqual(items[0]['quantity'], 2)
        self.assertEqual(items[0]['amount'], 10.00)
        self.assertEqual(items[0]['sub_items'], ['Sub-item 1'])
        self.assertEqual(subtotal, 45.00)

    def test_calculate_totals(self):
        self.assertEqual(calculate_totals(100.00, 10), 110.00)
        self.assertEqual(calculate_totals(50.00, 0), 50.00)

    def test_format_invoice_number(self):
        self.assertEqual(format_invoice_number('1'), '#001')
        self.assertEqual(format_invoice_number('#002'), '#002')
        self.assertEqual(format_invoice_number(3), '#003')

    def test_safe_input(self):
        with patch('builtins.input', return_value='42'):
            result = safe_input("Enter a number: ", int)
            self.assertEqual(result, 42)

        with patch('builtins.input', side_effect=['invalid', '3.14']):
            result = safe_input("Enter a float: ", float)
            self.assertEqual(result, 3.14)

    def test_parse_date(self):
        self.assertEqual(parse_date('2024-08-21'), 'August 21, 2024')
        with self.assertRaises(ValueError):
            parse_date('invalid-date')

if __name__ == '__main__':
    unittest.main()