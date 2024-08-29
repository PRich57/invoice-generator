from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models.contact import Contact as ContactModel
from ..schemas.contact import Contact, ContactCreate
from ..core.exceptions import ContactNotFoundException, ContactAlreadyExistsException

router = APIRouter()

@router.post("/", response_model=Contact)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    try:
        db_contact = ContactModel(**contact.model_dump())
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        return db_contact
    except IntegrityError:
        db.rollback()
        raise ContactAlreadyExistsException()

@router.get("/", response_model=list[Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    contacts = db.query(ContactModel).offset(skip).limit(limit).all()
    return contacts

@router.get("/{contact_id}", response_model=Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact

@router.put("/{contact_id}", response_model=Contact)
def update_contact(contact_id: int, contact: ContactCreate, db: Session = Depends(get_db)):
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if db_contact is None:
        raise ContactNotFoundException()
    
    for key, value in contact.model_dump().items():
        setattr(db_contact, key, value)
    
    try:
        db.commit()
        db.refresh(db_contact)
        return db_contact
    except IntegrityError:
        db.rollback()
        raise ContactAlreadyExistsException()

@router.delete("/{contact_id}", response_model=Contact)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    db_contact = db.query(ContactModel).filter(ContactModel.id == contact_id).first()
    if db_contact is None:
        raise ContactNotFoundException()
    
    db.delete(db_contact)
    db.commit()
    return db_contact