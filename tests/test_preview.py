import unittest
from unittest.mock import MagicMock, patch

from modules.preview import preview_invoice


class TestPreview(unittest.TestCase):

    def setUp(self):
        self.sample_invoice_data = {
            'invoice_number': '#001',
            'bill_to_name': 'John Doe',
            'bill_to_address1': '123 Main St',
            'bill_to_address2': 'Anytown, USA 12345',
            'send_to_name': 'Jane Smith',
            'send_to_address1': '456 Oak Rd',
            'send_to_address2': 'Somewhere, USA 67890',
            'date_of_service': '2024-08-21',
            'items': [
                {'description': 'Item 1', 'quantity': 2, 'amount': 10.00},
                {'description': 'Item 2', 'quantity': 1, 'amount': 25.00},
            ],
            'subtotal': 45.00,
            'tax': 3.60,
            'total': 48.60,
        }
        self.sample_template_name = 'default'

    @patch('modules.preview.config.get_template')
    @patch('modules.preview.Template')
    @patch('modules.preview.NamedTemporaryFile')
    @patch('modules.preview.webbrowser.open')
    def test_preview_invoice(self, mock_webbrowser, mock_temp_file, mock_template, mock_get_template):
        # Mock the config.get_template method
        mock_get_template.return_value = {
            'fonts': {'main': 'Arial'},
            'colors': {'primary': '#000000', 'secondary': '#888888', 'accent': '#4A86E8'},
            'font_sizes': {'title': 20, 'invoice_number': 14, 'section_header': 10, 'normal_text': 9},
        }

        # Mock the Template.render method
        mock_template_instance = MagicMock()
        mock_template.return_value = mock_template_instance
        mock_template_instance.render.return_value = "<html>Mocked HTML content</html>"

        # Mock the NamedTemporaryFile
        mock_temp_file_instance = MagicMock()
        mock_temp_file.return_value.__enter__.return_value = mock_temp_file_instance
        mock_temp_file_instance.name = '/tmp/mocked_temp_file.html'

        # Call the function
        preview_invoice(self.sample_invoice_data, self.sample_template_name)

        # Assertions
        mock_get_template.assert_called_once_with('templates', self.sample_template_name, default={})
        mock_template.assert_called_once()
        mock_template_instance.render.assert_called_once_with(
            invoice_data=self.sample_invoice_data,
            template_config=mock_get_template.return_value
        )
        mock_temp_file_instance.write.assert_called_once_with("<html>Mocked HTML content</html>")
        mock_webbrowser.assert_called_once_with('file:///tmp/mocked_temp_file.html')

if __name__ == '__main__':
    unittest.main()