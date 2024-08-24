from pydantic import BaseModel
from datetime import date
from .contact import Contact

class InvoiceItemBase(BaseModel):
    description: str
    quantity: int
    amount: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str
    date_of_service: date
    bill_to_id: int
    send_to_id: int
    subtotal: float
    tax: float
    total: float

class InvoiceCreate(InvoiceBase):
    items: list[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    bill_to: Contact
    send_to: Contact
    items: list[InvoiceItem]

    class Config:
        from_attributes = True