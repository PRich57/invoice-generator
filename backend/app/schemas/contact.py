from pydantic import BaseModel, Field, field_validator
import re

def validate_email(email: str | None) -> str | None:
    if email is None or email == "":
        return None
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('Invalid email format')
    return email

def validate_phone(phone: str | None) -> str | None:
    if phone is None or phone == "":
        return None
    pattern = r'^\+?1?\d{9,15}$'
    if not re.match(pattern, phone):
        raise ValueError('Invalid phone number format')
    return phone

class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    company: str | None = Field(None, max_length=100)
    email: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=20)
    street_address: str | None = Field(None, max_length=100)
    address_line2: str | None = Field(None, max_length=100)
    city: str | None = Field(None, max_length=100)
    state: str | None = Field(None, max_length=100)
    postal_code: str | None = Field(None, max_length=20)
    country: str | None = Field(None, max_length=100)
    type: str = Field(..., pattern=r'^(bill_to|send_to)$')
    notes: str | None = Field(None, max_length=500)

    @field_validator('email')
    @classmethod
    def email_validator(cls, v: str | None) -> str | None:
        return validate_email(v)

    @field_validator('phone')
    @classmethod
    def phone_validator(cls, v: str | None) -> str | None:
        return validate_phone(v)

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True