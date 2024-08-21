import yaml
from pathlib import Path

class ConfigManager:
    def __init__(self, config_path='config.yaml', template_config_path='template_config.yaml'):
        self.config_path = Path(config_path)
        self.template_config_path = Path(template_config_path)
        self.config = self.load_config(self.config_path)
        self.template_config = self.load_config(self.template_config_path)

    def load_config(self, path):
        try:
            with open(path, 'r') as config_file:
                return yaml.safe_load(config_file)
        except FileNotFoundError:
            print(f"Configuration file not found: {path}. Using default values.")
            return {}
        except yaml.YAMLError as e:
            print(f"Error parsing configuration file: {e}. Using default values.")
            return {}

    def get(self, *keys, default=None):
        return self._get_from_config(self.config, keys, default)

    def get_template(self, *keys, default=None):
        return self._get_from_config(self.template_config, keys, default)

    def _get_from_config(self, config, keys, default):
        value = config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value

config = ConfigManager()