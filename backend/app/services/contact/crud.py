import logging

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from ...core.exceptions import BadRequestException, ContactNotFoundException
from ...models.contact import Contact
from ...schemas.contact import ContactCreate


logger = logging.getLogger(__name__)


def get_contact(db: Session, contact_id: int, user_id: int) -> Contact:
    contact = db.query(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id).first()
    if contact is None:
        logger.warning(f"Contact not found: id={contact_id}, user_id={user_id}")
        raise ContactNotFoundException(contact_id=contact_id)
    return contact


def get_contacts(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    name: str | None = None, 
    email: str | None = None,
    sort_by: str | None = None, 
    sort_order: str = 'asc'
) -> list[Contact]:
    try:
        query = db.query(Contact).filter(Contact.user_id == user_id)

        # Apply filters
        if name:
            query = query.filter(Contact.name.ilike(f"%{name}%"))
        if email:
            query = query.filter(Contact.email.ilike(f"%{email}%"))

        # Apply sorting
        if sort_by:
            order_func = asc if sort_order == 'asc' else desc
            if sort_by == 'name':
                query = query.order_by(order_func(Contact.name))
            elif sort_by == 'email':
                query = query.order_by(order_func(Contact.email))
            elif sort_by == 'created_at':
                query = query.order_by(order_func(Contact.created_at))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        return query.all()
    except Exception as e:
        logger.error(f"Error retrieving contacts: {str(e)}")
        raise BadRequestException("An error occurred while retrieving contacts")


def create_contact(db: Session, contact: ContactCreate, user_id: int) -> Contact:
    try:
        db_contact = Contact(**contact.model_dump(), user_id=user_id)
        db.add(db_contact)
        db.commit()
        db.refresh(db_contact)
        logger.info(f"Created new contact: id={db_contact.id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error creating contact: {str(e)}")
        db.rollback()
        raise BadRequestException("An error occurred while creating the contact")


def update_contact(db: Session, contact_id: int, contact: ContactCreate, user_id: int) -> Contact:
    db_contact = get_contact(db, contact_id, user_id)
    try:
        for key, value in contact.model_dump().items():
            setattr(db_contact, key, value)
        db.commit()
        db.refresh(db_contact)
        logger.info(f"Updated contact: id={contact_id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error updating contact: {str(e)}")
        db.rollback()
        raise BadRequestException("An error occurred while updating the contact")


def delete_contact(db: Session, contact_id: int, user_id: int) -> Contact:
    db_contact = get_contact(db, contact_id, user_id)
    try:
        db.delete(db_contact)
        db.commit()
        logger.info(f"Deleted contact: id={contact_id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error deleting contact: {str(e)}")
        db.rollback()
        raise BadRequestException("An error occurred while deleting the contact")