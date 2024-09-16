from datetime import date
from decimal import Decimal

from ..core.exceptions import InvalidInvoiceNumberException, InvalidContactIdException, TemplateNotFoundException

from pydantic import BaseModel, Field, computed_field, field_validator


class InvoiceSubItemBase(BaseModel):
    description: str = Field(..., max_length=200)


class InvoiceSubItemCreate(InvoiceSubItemBase):
    pass


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
    pass


class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    subitems: list[InvoiceSubItem] = []
    
    @computed_field
    @property
    def line_total(self) -> Decimal:
        return (self.quantity * self.unit_price * (1 - self.discount_percentage / 100)).quantize(Decimal('0.01'))

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


class Invoice(InvoiceBase):
    id: int
    user_id: int
    items: list[InvoiceItem]

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return sum(item.line_total for item in self.items).quantize(Decimal('0.01'))

    @computed_field
    @property
    def tax(self) -> Decimal:
        return (self.subtotal * (1 - self.discount_percentage / 100) * self.tax_rate / 100).quantize(Decimal('0.01'))

    @computed_field
    @property
    def total(self) -> Decimal:
        return (self.subtotal * (1 - self.discount_percentage / 100) + self.tax).quantize(Decimal('0.01'))

    class Config:
        from_attributes = True