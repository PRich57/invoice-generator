import yaml
from pathlib import Path

class ConfigManager:
    def __init__(self, config_path='config.yml'):
        self.config_path = Path(config_path)
        self.config = self.load_config()

    def load_config(self):
        try:
            with open(self.config_path, 'r') as config_file:
                return yaml.safe_load(config_file)
        except FileNotFoundError:
            print(f"Configuration file not found: {self.config_path}. Using default values.")
            return {}
        except yaml.YAMLError as e:
            print(f"Error parsing configuration file: {e}. Using default values.")
            return {}

    def get(self, *keys, default=None):
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value

config = ConfigManager()