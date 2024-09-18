from datetime import date
from decimal import Decimal
from typing import Optional

from ..core.exceptions import InvalidInvoiceNumberException, InvalidContactIdException, TemplateNotFoundException

from pydantic import BaseModel, Field, field_validator


class InvoiceSubItemBase(BaseModel):
    id: Optional[int] = None
    description: str = Field(..., max_length=200)


class InvoiceSubItemCreate(InvoiceSubItemBase):
    id: Optional[int] = None


class InvoiceSubItem(InvoiceSubItemBase):
    id: int

    class Config:
        from_attributes = True


class InvoiceItemBase(BaseModel):
    description: str = Field(..., max_length=200)
    quantity: Decimal = Field(...)
    unit_price: Decimal = Field(default=Decimal('0.00'), ge=0)
    discount_percentage: Decimal = Field(default=0, ge=0, le=100)
    subitems: list[InvoiceSubItemCreate] = []


class InvoiceItemCreate(InvoiceItemBase):
    id: Optional[int] = None


class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    subitems: list[InvoiceSubItem] = []

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., min_length=1, max_length=50, example="#001")
    invoice_date: date
    bill_to_id: int = Field(..., gt=0)
    send_to_id: int = Field(..., gt=0)
    tax_rate: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    discount_percentage: Decimal = Field(default=0, ge=0, le=100)
    notes: str | None = Field(None, max_length=500)
    items: list[InvoiceItemCreate]
    template_id: int = Field(..., gt=0)
    
    @field_validator('invoice_number')
    def validate_invoice_number(cls, value: str) -> str:
        if value.lower() == 'string':
            raise InvalidInvoiceNumberException()
        return value.strip()
    
    @field_validator('bill_to_id', 'send_to_id')
    def validate_contact_ids(cls, value: int, field: str) -> int:
        if value <= 0:
            raise InvalidContactIdException(field.name)
        return value
    
    @field_validator('template_id')
    def validate_template_id(cls, value: int , field: str) -> int:
        if value <= 0:
            raise TemplateNotFoundException(field.name)
        return value


class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate]


class InvoiceDetail(BaseModel):
    id: int
    user_id: int
    invoice_number: str
    invoice_date: date
    bill_to_id: int
    send_to_id: int
    tax_rate: Decimal
    discount_percentage: Decimal
    notes: str | None
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    items: list[InvoiceItem]

    class Config:
        from_attributes = True


class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    invoice_date: date
    total: Decimal
    bill_to_id: int
    template_id: int
    
    class Config:
        from_attributes = True