from pathlib import Path

import yaml


class ConfigManager:
    def __init__(self, config_path: str = 'config.yaml', template_config_path: str = 'template_config.yaml'):
        self.config_path = Path(config_path)
        self.config_template_path = Path(f"{config_path}.template")
        self.template_config_path = Path(template_config_path)
        self.config = self.load_config(self.config_path, self.config_template_path)
        self.template_config = self.load_config(self.template_config_path)
        self.merged_config = self.merge_configs(self.template_config, self.config)

    def load_config(self, path: Path, template_path: Path = None) -> dict:
        try:
            with open(path, 'r') as config_file:
                return yaml.safe_load(config_file)
        except FileNotFoundError:
            if template_path and template_path.exists():
                print(f"Configuration file not found: {path}. Using template file.")
                with open(template_path, 'r') as template_file:
                    return yaml.safe_load(template_file)
            else:
                print(f"Configuration file not found: {path}. Using default values.")
                return {}
        except yaml.YAMLError as e:
            print(f"Error parsing configuration file: {e}. Using default values.")
            return {}

    def merge_configs(self, base: dict, override: dict) -> dict:
        merged = base.copy()
        for key, value in override.items():
            if isinstance(value, dict) and key in merged:
                merged[key] = self.merge_configs(merged[key], value)
            else:
                merged[key] = value
        return merged

    def get(self, *keys: str, default: object = None) -> object:
        return self._get_from_config(self.merged_config, keys, default)

    def get_template(self, *keys: str, default: object = None) -> object:
        return self._get_from_config(self.template_config, keys, default)

    def _get_from_config(self, config: dict, keys: tuple, default: object) -> object:
        value = config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value

config = ConfigManager()