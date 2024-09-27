from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..core.exceptions import InvalidIdError, NotFoundError


class InvoiceStatusEnum(str, Enum):
    PAID = "PAID"
    UNPAID = "UNPAID"
    OVERDUE = "OVERDUE"


class ClientTypeEnum(str, Enum):
    INDIVIDUAL = "INDIVIDUAL"
    BUSINESS = "BUSINESS"


class InvoiceTypeEnum(str, Enum):
    SERVICE = "SERVICE"
    PRODUCT = "PRODUCT"


class InvoiceSubItemBase(BaseModel):
    id: Optional[int] = None
    description: str = Field(..., max_length=200)


class InvoiceSubItemCreate(InvoiceSubItemBase):
    pass


class InvoiceSubItem(InvoiceSubItemBase):
    id: int
    order: int

    model_config = ConfigDict(from_attributes=True)


class InvoiceItemBase(BaseModel):
    description: str = Field(..., max_length=200)
    quantity: Decimal = Field(..., ge=0)
    unit_price: Decimal = Field(default=Decimal('0.00'), ge=0)
    discount_percentage: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    subitems: List[InvoiceSubItemCreate] = []

    @field_validator('quantity')
    def validate_quantity(cls, value):
        if value < 0:
            raise ValueError("Quantity must be non-negative")
        return value


class InvoiceItemCreate(InvoiceItemBase):
    id: Optional[int] = None


class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    subitems: List[InvoiceSubItem] = []
    line_total: Decimal
    order: int

    model_config = ConfigDict(from_attributes=True)


class InvoiceBase(BaseModel):
    invoice_number: str = Field(..., min_length=1, max_length=50, example="#001")
    invoice_date: date
    bill_to_id: int = Field(..., gt=0)
    send_to_id: int = Field(..., gt=0)
    tax_rate: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    discount_percentage: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=500)
    items: List[InvoiceItemCreate]
    template_id: int = Field(..., gt=0)
    status: Optional[InvoiceStatusEnum] = Field(None)
    client_type: Optional[ClientTypeEnum] = Field(None)
    invoice_type: Optional[InvoiceTypeEnum] = Field(None)
    
    @field_validator('invoice_number')
    def validate_invoice_number(cls, value: str) -> str:
        if value.lower() == 'string':
            raise InvalidIdError("invoice_number")
        return value.strip()
    
    @field_validator('bill_to_id', 'send_to_id')
    def validate_contact_ids(cls, value: int, field: str) -> int:
        if value <= 0:
            raise InvalidIdError(field.name)
        return value
    
    @field_validator('template_id')
    def validate_template_id(cls, value: int, field: str) -> int:
        if value <= 0:
            raise NotFoundError(field.name)
        return value


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceDetail(BaseModel):    
    id: int
    user_id: int
    invoice_number: str
    invoice_date: date
    bill_to_id: int
    send_to_id: int
    tax_rate: Decimal
    discount_percentage: Decimal
    notes: Optional[str]
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    items: List[InvoiceItem]
    template_id: int
    status: str
    client_type: str
    invoice_type: str
    
    @property
    def discount_amount(self) -> Decimal:
        return self.subtotal * (self.discount_percentage / Decimal('100'))
    
    @property
    def discounted_subtotal(self) -> Decimal:
        return self.subtotal - self.discount_amount
    
    model_config = ConfigDict(from_attributes=True)


class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    invoice_date: date
    total: Decimal
    bill_to_id: int
    send_to_id: int
    template_id: int
    status: str
    client_type: str
    invoice_type: str
    
    model_config = ConfigDict(from_attributes=True)
