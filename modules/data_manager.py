import json
import os
from modules.config_manager import config

def load_data(file_path=None):
    if file_path is None:
        file_path = os.path.join(config.get('paths', 'output_directory'), 'company_data.json')
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    else:
        return {}

def save_data(data, file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)