from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    company = Column(String, nullable=True)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    street_address = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    type = Column(String)  # 'bill_to' or 'send_to'
    notes = Column(String, nullable=True)

    user = relationship("User", back_populates="contacts")