import unittest
from unittest.mock import patch, MagicMock
from click.testing import CliRunner
from modules.cli import generate_invoice

class TestCLI(unittest.TestCase):

    def setUp(self):
        self.runner = CliRunner()

    @patch('modules.cli.load_data')
    @patch('modules.cli.create_invoice')
    @patch('modules.cli.save_data')
    @patch('modules.cli.generate_pdf')
    @patch('modules.cli.preview_invoice')
    def test_generate_invoice(self, mock_preview, mock_generate_pdf, mock_save_data, mock_create_invoice, mock_load_data):
        # Mock the necessary functions
        mock_load_data.return_value = {}
        mock_create_invoice.return_value = {'invoice_number': '#001'}

        # Test without preview
        result = self.runner.invoke(generate_invoice, ['--output', 'test_invoice', '--invoice-number', '001'])
        self.assertEqual(result.exit_code, 0)
        self.assertIn("Invoice 'test_invoice.pdf' and data saved successfully!", result.output)

        # Assertions
        mock_load_data.assert_called_once()
        mock_create_invoice.assert_called_once()
        mock_save_data.assert_called_once()
        mock_generate_pdf.assert_called_once()
        mock_preview.assert_not_called()

        # Reset mocks
        mock_load_data.reset_mock()
        mock_create_invoice.reset_mock()
        mock_save_data.reset_mock()
        mock_generate_pdf.reset_mock()

        # Test with preview
        with patch('modules.cli.click.confirm', return_value=True):
            result = self.runner.invoke(generate_invoice, ['--output', 'test_invoice', '--invoice-number', '001', '--preview'])
        self.assertEqual(result.exit_code, 0)
        self.assertIn("Invoice 'test_invoice.pdf' and data saved successfully!", result.output)

        # Assertions
        mock_load_data.assert_called_once()
        mock_create_invoice.assert_called_once()
        mock_save_data.assert_called_once()
        mock_generate_pdf.assert_called_once()
        mock_preview.assert_called_once()

if __name__ == '__main__':
    unittest.main()