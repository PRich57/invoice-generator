from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    contacts = relationship("Contact", back_populates="user")
    invoices = relationship("Invoice", back_populates="user")
    templates = relationship("Template", back_populates="user")