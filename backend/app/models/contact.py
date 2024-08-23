from sqlalchemy import Column, Integer, String
from ..database import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address1 = Column(String)
    address2 = Column(String)
    phone = Column(String)
    email = Column(String, unique=True, index=True)
    type = Column(String)  # 'bill_to' or 'send_to'