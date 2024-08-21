import unittest
from unittest.mock import patch, mock_open
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.data_manager import load_data, save_data

class TestDataManager(unittest.TestCase):

    def setUp(self):
        self.sample_data = {
            'companies': {'1': {'name': 'Test Company', 'address1': '123 Test St', 'address2': 'Test City, TS 12345'}},
            'employees': {'1': {'name': 'John Doe', 'address1': '456 Employee St', 'address2': 'Work City, WC 67890'}}
        }

    @patch('modules.data_manager.os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data=json.dumps({'companies': {}, 'employees': {}}))
    def test_load_data_existing_file(self, mock_file, mock_exists):
        mock_exists.return_value = True
        data = load_data('test_path.json')
        self.assertEqual(data, {'companies': {}, 'employees': {}})
        mock_file.assert_called_once_with('test_path.json', 'r')

    @patch('modules.data_manager.os.path.exists')
    def test_load_data_non_existing_file(self, mock_exists):
        mock_exists.return_value = False
        data = load_data('non_existing_path.json')
        self.assertEqual(data, {'companies': {}, 'employees': {}})

    @patch('modules.data_manager.os.makedirs')
    @patch('builtins.open', new_callable=mock_open)
    def test_save_data(self, mock_file, mock_makedirs):
        save_data(self.sample_data, 'test_save_path.json')
        mock_makedirs.assert_called_once()
        mock_file.assert_called_once_with('test_save_path.json', 'w')
        
        # Get all write calls and join them into a single string
        written_data = ''.join(call.args[0] for call in mock_file().write.call_args_list)
        
        # Parse the written data and compare with the original
        parsed_data = json.loads(written_data)
        self.assertEqual(parsed_data, self.sample_data)

if __name__ == '__main__':
    unittest.main()