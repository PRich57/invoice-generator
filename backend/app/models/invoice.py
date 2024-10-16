from decimal import Decimal
from enum import Enum
from sqlalchemy import (
    DECIMAL,
    BigInteger,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Index,
    Enum as SQLEnum,
    func
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from ..database import Base


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


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    __table_args__ = (
        Index('ix_invoice_items_invoice_id', 'invoice_id'),
    )

    id = Column(BigInteger, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), index=True)
    description = Column(String(200), nullable=False)
    quantity = Column(DECIMAL(10, 2), nullable=False, default=Decimal('0.00'))
    unit_price = Column(DECIMAL(10, 2), nullable=False, default=Decimal('0.00'))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=Decimal('0.00'))
    order = Column(Integer, nullable=False)

    invoice = relationship("Invoice", back_populates="items")
    subitems = relationship(
        "InvoiceSubItem",
        back_populates="invoice_item",
        cascade="all, delete-orphan",
        order_by="InvoiceSubItem.order"
    )

    @hybrid_property
    def line_total(self):
        return self.quantity * self.unit_price * (Decimal('1') - self.discount_percentage / Decimal('100'))


class InvoiceSubItem(Base):
    __tablename__ = "invoice_subitems"

    id = Column(BigInteger, primary_key=True, index=True)
    invoice_item_id = Column(BigInteger, ForeignKey("invoice_items.id"), index=True)
    description = Column(String(200), nullable=False)
    order = Column(Integer, nullable=False)

    invoice_item = relationship("InvoiceItem", back_populates="subitems")


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        Index('ix_invoices_invoice_date', 'invoice_date'),
        Index('ix_invoices_total', 'total'),
        Index('ix_invoices_bill_to_id', 'bill_to_id'),
        Index('ix_invoices_send_to_id', 'send_to_id'),
        Index('ix_invoices_status', 'status'),
        Index('ix_invoices_client_type', 'client_type'),
        Index('ix_invoices_invoice_type', 'invoice_type'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    invoice_number = Column(String(50), unique=True, index=True, nullable=False)
    invoice_date = Column(Date, nullable=False)
    bill_to_id = Column(Integer, ForeignKey("contacts.id"), index=True, nullable=False)
    send_to_id = Column(Integer, ForeignKey("contacts.id"), index=True, nullable=False)
    tax_rate = Column(DECIMAL(5, 2), nullable=False, default=Decimal('0.00'))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=Decimal('0.00'))
    notes = Column(String(500), nullable=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False, index=True)

    status = Column(SQLEnum(InvoiceStatusEnum), nullable=False, default=InvoiceStatusEnum.UNPAID)
    client_type = Column(SQLEnum(ClientTypeEnum), nullable=False, default=ClientTypeEnum.INDIVIDUAL)
    invoice_type = Column(SQLEnum(InvoiceTypeEnum), nullable=False, default=InvoiceTypeEnum.SERVICE)

    subtotal = Column(DECIMAL(10, 2), nullable=False, default=Decimal('0.00'))
    tax = Column(DECIMAL(10, 2), nullable=False, default=Decimal('0.00'))
    total = Column(DECIMAL(10, 2), nullable=False, default=Decimal('0.00'))

    user = relationship("User", back_populates="invoices")
    bill_to = relationship("Contact", foreign_keys=[bill_to_id])
    send_to = relationship("Contact", foreign_keys=[send_to_id])
    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceItem.order"
    )
    template = relationship("Template")

    def calculate_totals(self):
        """Calculates and updates the subtotal, tax, and total for the invoice."""
        self.subtotal = sum(item.line_total for item in self.items)
        self.tax = self.discounted_subtotal * (self.tax_rate / Decimal('100'))
        self.total = self.discounted_subtotal + self.tax

    @property
    def discount_amount(self):
        return self.subtotal * (self.discount_percentage / Decimal('100'))
    
    @property
    def discounted_subtotal(self):
        return self.subtotal - self.discount_amount