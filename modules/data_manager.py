from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    bill_to_contacts = relationship("BillToContact", back_populates="user")
    send_to_contacts = relationship("SendToContact", back_populates="user")

class BillToContact(Base):
    __tablename__ = 'bill_to_contacts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    address1 = Column(String)
    address2 = Column(String)
    phone = Column(String)
    email = Column(String)
    user = relationship("User", back_populates="bill_to_contacts")

class SendToContact(Base):
    __tablename__ = 'send_to_contacts'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    address1 = Column(String)
    address2 = Column(String)
    phone = Column(String)
    email = Column(String)
    user = relationship("User", back_populates="send_to_contacts")

# Replace with your actual database URL
DATABASE_URL = "postgresql://username:password@your-rds-endpoint:5432/dbname"

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(engine)

def get_user(username):
    session = Session()
    user = session.query(User).filter_by(username=username).first()
    session.close()
    return user

def add_contact(user_id, contact_type, contact_info):
    session = Session()
    user = session.query(User).get(user_id)
    if not user:
        session.close()
        return None

    if contact_type == 'bill_to':
        contact = BillToContact(user=user, **contact_info)
    elif contact_type == 'send_to':
        contact = SendToContact(user=user, **contact_info)
    else:
        session.close()
        return None

    session.add(contact)
    session.commit()
    contact_id = contact.id
    session.close()
    return contact_id

def get_contacts(user_id, contact_type):
    session = Session()
    user = session.query(User).get(user_id)
    if not user:
        session.close()
        return []

    if contact_type == 'bill_to':
        contacts = user.bill_to_contacts
    elif contact_type == 'send_to':
        contacts = user.send_to_contacts
    else:
        session.close()
        return []

    result = [{'id': c.id, 'name': c.name} for c in contacts]
    session.close()
    return result

def get_contact(user_id, contact_type, contact_id):
    session = Session()
    user = session.query(User).get(user_id)
    if not user:
        session.close()
        return None

    if contact_type == 'bill_to':
        contact = session.query(BillToContact).filter_by(id=contact_id, user_id=user_id).first()
    elif contact_type == 'send_to':
        contact = session.query(SendToContact).filter_by(id=contact_id, user_id=user_id).first()
    else:
        session.close()
        return None

    if not contact:
        session.close()
        return None

    result = {
        'id': contact.id,
        'name': contact.name,
        'address1': contact.address1,
        'address2': contact.address2,
        'phone': contact.phone,
        'email': contact.email
    }
    session.close()
    return result