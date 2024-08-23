import os
import sys
import unittest
from unittest.mock import MagicMock, call, patch

from reportlab.lib.pagesizes import LETTER

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.pdf_generator import generate_pdf


class TestPDFGenerator(unittest.TestCase):

    def setUp(self):
        self.sample_invoice_data = {
            'invoice_number': '#001',
            'bill_to_name': 'Test Company',
            'bill_to_address1': '123 Test St',
            'bill_to_address2': 'Test City, TS 12345',
            'send_to_name': 'John Doe',
            'send_to_address1': '456 Employee St',
            'send_to_address2': 'Work City, WC 67890',
            'date_of_service': 'August 21, 2024',
            'items': [
                {'description': 'Item 1', 'quantity': 2, 'amount': 10.00, 'sub_items': ['Sub-item 1']},
                {'description': 'Item 2', 'quantity': 1, 'amount': 25.00, 'sub_items': []}
            ],
            'subtotal': 45.00,
            'tax_percentage': 10.00,
            'tax': 4.50,
            'total': 49.50
        }

    @patch('modules.pdf_generator.SimpleDocTemplate')
    @patch('modules.pdf_generator.Table')
    @patch('modules.pdf_generator.Paragraph')
    @patch('modules.pdf_generator.config')
    def test_generate_pdf_basic(self, mock_config, mock_paragraph, mock_table, mock_simple_doc):
        mock_config.get.return_value = 'mocked_output_dir'
        mock_config.get_template.return_value = {
            'colors': {'primary': '#000000', 'secondary': '#888888', 'accent': '#444444'},
            'fonts': {'main': 'Helvetica', 'accent': 'Helvetica-Bold'},
            'font_sizes': {'title': 20, 'invoice_number': 14, 'section_header': 10, 'normal_text': 9},
            'layout': {'page_size': 'A4', 'margin_top': 0.3, 'margin_right': 0.5, 'margin_bottom': 0.5, 'margin_left': 0.5}
        }

        generate_pdf(self.sample_invoice_data, 'test_output', 'default')

        mock_simple_doc.assert_called_once()
        self.assertIn('test_output.pdf', mock_simple_doc.call_args[0][0])
        self.assertEqual(mock_table.call_count, 7)
        self.assertGreater(mock_paragraph.call_count, 0)

    @patch('modules.pdf_generator.SimpleDocTemplate')
    @patch('modules.pdf_generator.Table')
    @patch('modules.pdf_generator.Paragraph')
    @patch('modules.pdf_generator.config')
    def test_generate_pdf_no_items(self, mock_config, mock_paragraph, mock_table, mock_simple_doc):
        mock_config.get.return_value = 'mocked_output_dir'
        mock_config.get_template.return_value = {
            'colors': {'primary': '#000000', 'secondary': '#888888', 'accent': '#444444'},
            'fonts': {'main': 'Helvetica', 'accent': 'Helvetica-Bold'},
            'font_sizes': {'title': 20, 'invoice_number': 14, 'section_header': 10, 'normal_text': 9},
            'layout': {'page_size': 'A4', 'margin_top': 0.3, 'margin_right': 0.5, 'margin_bottom': 0.5, 'margin_left': 0.5}
        }
        invoice_data = self.sample_invoice_data.copy()
        invoice_data['items'] = []
        invoice_data['subtotal'] = 0.00
        invoice_data['tax'] = 0.00
        invoice_data['total'] = 0.00

        generate_pdf(invoice_data, 'test_output_no_items', 'default')

        self.assertEqual(mock_table.call_count, 7)  # Header, empty items table, and totals

    @patch('modules.pdf_generator.SimpleDocTemplate')
    @patch('modules.pdf_generator.Table')
    @patch('modules.pdf_generator.Paragraph')
    @patch('modules.pdf_generator.config')
    def test_generate_pdf_custom_template(self, mock_config, mock_paragraph, mock_table, mock_simple_doc):
        mock_config.get.return_value = 'mocked_output_dir'
        custom_template = {
            'colors': {'primary': '#FF0000', 'secondary': '#00FF00', 'accent': '#0000FF'},
            'fonts': {'main': 'Times-Roman', 'accent': 'Times-Bold'},
            'font_sizes': {'title': 24, 'invoice_number': 18, 'section_header': 12, 'normal_text': 10},
            'layout': {'page_size': 'LETTER', 'margin_top': 0.4, 'margin_right': 0.6, 'margin_bottom': 0.4, 'margin_left': 0.6}
        }
        mock_config.get_template.return_value = custom_template

        generate_pdf(self.sample_invoice_data, 'test_output_custom', 'custom')

        mock_simple_doc.assert_called_once()
        self.assertIn('test_output_custom.pdf', mock_simple_doc.call_args[0][0])
        self.assertEqual(mock_simple_doc.call_args[1]['pagesize'], LETTER)

    @patch('modules.pdf_generator.SimpleDocTemplate')
    @patch('modules.pdf_generator.config')
    def test_generate_pdf_invalid_template(self, mock_config, mock_simple_doc):
        mock_config.get.return_value = 'mocked_output_dir'
        mock_config.get_template.return_value = {}  # Return an empty dict for invalid template
        
        # The function should use default values instead of raising an error
        generate_pdf(self.sample_invoice_data, 'test_output_invalid', 'nonexistent_template')
        
        # Assert that get_template was called with the invalid template name
        mock_config.get_template.assert_called_with('templates', 'nonexistent_template', default={})
        
        # Check that SimpleDocTemplate was called (i.e., PDF generation attempted)
        mock_simple_doc.assert_called_once()
        self.assertIn('test_output_invalid.pdf', mock_simple_doc.call_args[0][0])

if __name__ == '__main__':
    unittest.main()