from fastapi import APIRouter, Depends, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import (ContactAlreadyExistsException,
                               ContactNotFoundException)
from ..database import get_db
from ..schemas.contact import Contact, ContactCreate
from ..schemas.user import User
from ..services.contact import crud


router = APIRouter()


@router.post("/", response_model=Contact)
def create_contact(
    contact: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return crud.create_contact(db, contact, current_user.id)
    except IntegrityError:
        raise ContactAlreadyExistsException()


@router.get("/", response_model=list[Contact])
def read_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    name: str | None = None,
    email: str | None = None,
    sort_by: str | None = Query(None, enum=['name', 'email', 'created_at']),
    sort_order: str | None = Query('asc', enum=['asc', 'desc']),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve contacts with pagination, filtering, and sorting.
    """
    contacts = crud.get_contacts(
        db, 
        current_user.id, 
        skip=skip, 
        limit=limit, 
        name=name, 
        email=email, 
        sort_by=sort_by, 
        sort_order=sort_order
    )
    return contacts


@router.get("/{contact_id}", response_model=Contact)
def read_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = crud.get_contact(db, contact_id, current_user.id)
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
    db_contact = crud.update_contact(db, contact_id, contact, current_user.id)
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact


@router.delete("/{contact_id}", response_model=Contact)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_contact = crud.delete_contact(db, contact_id, current_user.id)
    if db_contact is None:
        raise ContactNotFoundException()
    return db_contact