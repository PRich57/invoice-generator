from pydantic import BaseModel, Field, computed_field
from datetime import date
from decimal import Decimal

class InvoiceItemBase(BaseModel):
    description: str = Field(..., max_length=200)
    quantity: Decimal = Field(..., gt=0)
    rate: Decimal = Field(..., ge=0)

    @computed_field
    @property
    def amount(self) -> Decimal:
        return self.quantity * self.rate

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., max_length=50)
    date_of_service: date
    bill_to_id: int
    send_to_id: int
    tax_rate: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    notes: str | None = Field(None, max_length=500)
    manual_total: Decimal | None = Field(None, ge=0)

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return sum(item.amount for item in self.items)

    @computed_field
    @property
    def tax(self) -> Decimal:
        return (self.subtotal * self.tax_rate / 100).quantize(Decimal('0.01'))

    @computed_field
    @property
    def total(self) -> Decimal:
        if self.manual_total is not None:
            return self.manual_total
        return (self.subtotal + self.tax).quantize(Decimal('0.01'))

class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    items: list[InvoiceItem]

    class Config:
        from_attributes = True