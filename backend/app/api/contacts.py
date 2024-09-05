from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import (ContactAlreadyExistsException,
                               ContactNotFoundException)
from ..database import get_db
from ..schemas.contact import Contact, ContactCreate
from ..schemas.user import User
from ..services import contact_service

router = APIRouter()

@router.post("/", response_model=Contact)
def create_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return contact_service.create_contact(db, contact, current_user.id)
    except IntegrityError:
        raise ContactAlreadyExistsException()

@router.get("/", response_model=list[Contact])
def read_contacts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contacts = contact_service.get_contacts(db, current_user.id, skip=skip, limit=limit)
    return contacts

@router.get("/{contact_id}", response_model=Contact)
def read_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = contact_service.get_contact(db, contact_id, current_user.id)
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact

@router.put("/{contact_id}", response_model=Contact)
def update_contact(
    contact_id: int,
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = contact_service.update_contact(db, contact_id, contact, current_user.id)
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact

@router.delete("/{contact_id}", response_model=Contact)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = contact_service.delete_contact(db, contact_id, current_user.id)
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact