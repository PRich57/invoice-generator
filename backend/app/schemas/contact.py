from pydantic import BaseModel, EmailStr

class ContactBase(BaseModel):
    name: str
    address1: str | None = None
    address2: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    type: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int

    class Config:
        orm_mode = True