from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(Integer)
    amount = Column(Float)

    invoice = relationship("Invoice", back_populates="items")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    date_of_service = Column(Date)
    bill_to_id = Column(Integer, ForeignKey("contacts.id"))
    send_to_id = Column(Integer, ForeignKey("contacts.id"))
    subtotal = Column(Float)
    tax = Column(Float)
    total = Column(Float)

    bill_to = relationship("Contact", foreign_keys=[bill_to_id])
    send_to = relationship("Contact", foreign_keys=[send_to_id])
    items = relationship("InvoiceItem", back_populates="invoice")