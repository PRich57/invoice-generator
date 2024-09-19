from decimal import Decimal
from sqlalchemy import DECIMAL, Column, Date, ForeignKey, Integer, String, Index
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from ..database import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    __table_args__ = (
        Index('ix_invoice_items_invoice_id', 'invoice_id'),
    )

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), index=True)
    description = Column(String)
    quantity = Column(DECIMAL(10, 2))
    unit_price = Column(DECIMAL(10, 2))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=0)
    order = Column(Integer, nullable=False)

    invoice = relationship("Invoice", back_populates="items")
    subitems = relationship("InvoiceSubItem", back_populates="invoice_item", cascade="all, delete-orphan")

    @hybrid_property
    def line_total(self):
        return self.quantity * self.unit_price * (Decimal('1') - self.discount_percentage / Decimal('100'))


class InvoiceSubItem(Base):
    __tablename__ = "invoice_subitems"

    id = Column(Integer, primary_key=True, index=True)
    invoice_item_id = Column(Integer, ForeignKey("invoice_items.id"), index=True)
    description = Column(String)
    order = Column(Integer, nullable=False)

    invoice_item = relationship("InvoiceItem", back_populates="subitems")


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        Index('ix_invoices_invoice_date', 'invoice_date'),
        Index('ix_invoices_total', 'total'),
        Index('ix_invoices_bill_to_id', 'bill_to_id'),
        Index('ix_invoices_send_to_id', 'send_to_id'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    invoice_number = Column(String, unique=True, index=True)
    invoice_date = Column(Date)
    bill_to_id = Column(Integer, ForeignKey("contacts.id"), index=True)
    send_to_id = Column(Integer, ForeignKey("contacts.id"), index=True)
    tax_rate = Column(DECIMAL(5, 2))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=0)
    notes = Column(String, nullable=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False, index=True)

    # New columns to store precomputed values
    subtotal = Column(DECIMAL(10, 2), default=0)
    tax = Column(DECIMAL(10, 2), default=0)
    total = Column(DECIMAL(10, 2), default=0)

    user = relationship("User", back_populates="invoices")
    bill_to = relationship("Contact", foreign_keys=[bill_to_id])
    send_to = relationship("Contact", foreign_keys=[send_to_id])
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
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
