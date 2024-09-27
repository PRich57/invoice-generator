import re
from datetime import datetime
import phonenumbers
from phonenumbers.phonenumberutil import NumberParseException

from pydantic import BaseModel, Field, field_validator


def validate_email(email: str | None) -> str | None:
    if email is None or email == "":
        return None
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError('Invalid email format')
    return email


def validate_phone(phone: str | None) -> str | None:
    if phone is None or phone.strip() == "":
        return None
    try:
        parsed_phone = phonenumbers.parse(phone, None)
        if not phonenumbers.is_possible_number(parsed_phone):
            raise ValueError('Invalid phone number format')
        if not phonenumbers.is_valid_number(parsed_phone):
            raise ValueError('Invalid phone number')
        formatted_phone = phonenumbers.format_number(parsed_phone, phonenumbers.PhoneNumberFormat.E164)
        return formatted_phone
    except NumberParseException:
        raise ValueError('Invalid phone number format')


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
    created_at: datetime

    class Config:
        from_attributes = True