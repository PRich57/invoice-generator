from pydantic import BaseModel, Field

class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    content: dict
    font_family: str = Field(..., max_length=50)
    font_size: int = Field(..., gt=0)
    primary_color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    secondary_color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')
    logo_url: str | None = Field(None, max_length=255)
    custom_css: str | None = Field(None, max_length=1000)

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True