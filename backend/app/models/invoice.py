from decimal import Decimal

from sqlalchemy import DECIMAL, Column, Date, ForeignKey, Integer, String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from ..database import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(DECIMAL(10, 2))
    unit_price = Column(DECIMAL(10, 2))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=0)

    invoice = relationship("Invoice", back_populates="items")
    subitems = relationship("InvoiceSubItem", back_populates="invoice_item", cascade="all, delete-orphan")

    @hybrid_property
    def line_total(self):
        return self.quantity * self.unit_price * (1 - self.discount_percentage / 100)
    
class InvoiceSubItem(Base):
    __tablename__ = "invoice_subitems"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_item_id = Column(Integer, ForeignKey("invoice_items.id"))
    description = Column(String)
    
    invoice_item = relationship("InvoiceItem", back_populates="subitems")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    invoice_number = Column(String, unique=True, index=True)
    invoice_date = Column(Date)
    bill_to_id = Column(Integer, ForeignKey("contacts.id"))
    send_to_id = Column(Integer, ForeignKey("contacts.id"))
    tax_rate = Column(DECIMAL(5, 2))
    discount_percentage = Column(DECIMAL(5, 2), nullable=True, default=0)
    notes = Column(String, nullable=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False)

    user = relationship("User", back_populates="invoices")
    bill_to = relationship("Contact", foreign_keys=[bill_to_id])
    send_to = relationship("Contact", foreign_keys=[send_to_id])
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    template = relationship("Template")
    
    @hybrid_property
    def subtotal(self):
        return sum(item.line_total for item in self.items)
    
    @hybrid_property
    def discount_amount(self):
        return self.subtotal * (self.discount_percentage / 100)
    
    @hybrid_property
    def discounted_subtotal(self):
        return self.subtotal - self.discount_amount
    
    @hybrid_property
    def tax(self):
        return self.discounted_subtotal * (self.tax_rate / 100)
    
    @hybrid_property
    def total(self):
        return self.discounted_subtotal + self.tax