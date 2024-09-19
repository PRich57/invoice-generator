import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.exceptions import BadRequestException, ContactNotFoundException
from ...models.contact import Contact
from ...schemas.contact import ContactCreate

logger = logging.getLogger(__name__)


async def get_contact(db: AsyncSession, contact_id: int, user_id: int) -> Contact:
    stmt = select(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id)
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()
    if contact is None:
        logger.warning(f"Contact not found: id={contact_id}, user_id={user_id}")
        raise ContactNotFoundException(contact_id=contact_id)
    return contact


async def get_contacts(
    db: AsyncSession, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100, 
    name: str | None = None, 
    email: str | None = None,
    sort_by: str | None = None, 
    sort_order: str = 'asc'
) -> list[Contact]:
    try:
        stmt = select(Contact).filter(Contact.user_id == user_id)

        # Apply filters
        if name:
            stmt = stmt.filter(Contact.name.ilike(f"%{name}%"))
        if email:
            stmt = stmt.filter(Contact.email.ilike(f"%{email}%"))

        # Apply sorting
        if sort_by:
            order_func = func.asc if sort_order == 'asc' else func.desc
            if sort_by == 'name':
                stmt = stmt.order_by(order_func(Contact.name))
            elif sort_by == 'email':
                stmt = stmt.order_by(order_func(Contact.email))
            elif sort_by == 'created_at':
                stmt = stmt.order_by(order_func(Contact.created_at))

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)

        result = await db.execute(stmt)
        return result.scalars().all()
    except Exception as e:
        logger.error(f"Error retrieving contacts: {str(e)}")
        raise BadRequestException("An error occurred while retrieving contacts")


async def create_contact(db: AsyncSession, contact: ContactCreate, user_id: int) -> Contact:
    try:
        db_contact = Contact(**contact.model_dump(), user_id=user_id)
        db.add(db_contact)
        await db.commit()
        await db.refresh(db_contact)
        logger.info(f"Created new contact: id={db_contact.id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error creating contact: {str(e)}")
        await db.rollback()
        raise BadRequestException("An error occurred while creating the contact")


async def update_contact(db: AsyncSession, contact_id: int, contact: ContactCreate, user_id: int) -> Contact:
    db_contact = await get_contact(db, contact_id, user_id)
    try:
        for key, value in contact.model_dump().items():
            setattr(db_contact, key, value)
        await db.commit()
        await db.refresh(db_contact)
        logger.info(f"Updated contact: id={contact_id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error updating contact: {str(e)}")
        await db.rollback()
        raise BadRequestException("An error occurred while updating the contact")


async def delete_contact(db: AsyncSession, contact_id: int, user_id: int) -> Contact:
    db_contact = await get_contact(db, contact_id, user_id)
    try:
        await db.delete(db_contact)
        await db.commit()
        logger.info(f"Deleted contact: id={contact_id}, user_id={user_id}")
        return db_contact
    except Exception as e:
        logger.error(f"Error deleting contact: {str(e)}")
        await db.rollback()
        raise BadRequestException("An error occurred while deleting the contact")