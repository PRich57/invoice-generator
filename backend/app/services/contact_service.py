from sqlalchemy.orm import Session

from ..models.contact import Contact
from ..schemas.contact import ContactCreate


def get_contact(db: Session, contact_id: int, user_id: int):
    return db.query(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id).first()

def get_contacts(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Contact).filter(Contact.user_id == user_id).offset(skip).limit(limit).all()

def create_contact(db: Session, contact: ContactCreate, user_id: int):
    db_contact = Contact(**contact.model_dump(), user_id=user_id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def update_contact(db: Session, contact_id: int, contact: ContactCreate, user_id: int):
    db_contact = get_contact(db, contact_id, user_id)
    if db_contact is None:
        return None
    for key, value in contact.model_dump().items():
        setattr(db_contact, key, value)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int, user_id: int):
    db_contact = get_contact(db, contact_id, user_id)
    if db_contact is None:
        return None
    db.delete(db_contact)
    db.commit()
    return db_contact