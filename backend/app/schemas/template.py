from pydantic import BaseModel, Field

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    is_default: bool = Field(default=False)
    colors: dict
    fonts: dict
    font_sizes: dict
    layout: dict
    custom_css: str | None = Field(None, max_length=1000)

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    user_id: int | None = None

    class Config:
        from_attributes = True