from pydantic import BaseModel, EmailStr

class ContactBase(BaseModel):
    name: str
    address1: str
    address2: str | None = None
    phone: str
    email: EmailStr
    type: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int

    class Config:
        orm_mode = True