from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TemplateColorSchema(BaseModel):
    primary: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    secondary: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    accent: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    text: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    background: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')


class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    is_default: bool = Field(default=False)
    colors: TemplateColorSchema
    fonts: dict
    font_sizes: dict
    layout: dict
    custom_css: str | None = Field(None, max_length=1000)

    @field_validator('fonts', 'font_sizes', 'layout')
    def validate_json_fields(cls, v):
        if not isinstance(v, dict):
            raise ValueError('Must be a valid JSON object')
        return v


class TemplateCreate(TemplateBase):
    pass


class Template(TemplateBase):
    id: int
    user_id: int | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True