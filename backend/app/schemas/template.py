from pydantic import BaseModel, Field


class TemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    content: dict

class TemplateCreate(TemplateBase):
    pass

class TemplateUpdate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True