from pydantic import BaseModel
from datetime import date
from typing import List
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
        orm_mode = True

class InvoiceBase(BaseModel):
    invoice_number: str
    date_of_service: date
    bill_to_id: int
    send_to_id: int
    subtotal: float
    tax: float
    total: float

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    bill_to: Contact
    send_to: Contact
    items: List[InvoiceItem]

    class Config:
        orm_mode = True