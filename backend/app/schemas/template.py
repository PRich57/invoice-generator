from typing import Optional

from pydantic import BaseModel, Field


class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    is_default: bool = Field(default=False)
    colors: dict
    fonts: dict
    font_sizes: dict
    layout: dict
    custom_css: str | None = Field(None, max_length=1000)
    
    
class TemplateColorSchema(BaseModel):
    primary: str
    secondary: str
    accent: str
    text: str
    background: str


class TemplateCreate(TemplateBase):
    colors: TemplateColorSchema
    pass


class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    colors: Optional[TemplateColorSchema] = None
    fonts: Optional[dict] = None
    font_sizes: Optional[dict] = None
    layout: Optional[dict] = None
    custom_css: Optional[str] = Field(None, max_length=1000)


class Template(TemplateBase):
    id: int
    user_id: int | None = None

    class Config:
        from_attributes = True