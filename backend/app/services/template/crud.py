import logging
from datetime import datetime, timedelta, timezone
from functools import lru_cache

from sqlalchemy import delete, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ...core.exceptions import (TemplateAlreadyExistsException,
                                TemplateNotFoundException)
from ...models.template import Template
from ...schemas.template import TemplateCreate, TemplateUpdate

logger = logging.getLogger(__name__)


DEFAULT_TEMPLATES = {
    "default": {
        "colors": {
            "primary": "#000000",
            "secondary": "#555555",
            "accent": "#888888",
            "text": "#000000",
            "background": "#FFFFFF"
        },
        "fonts": {
            "main": "Helvetica",
            "accent": "Helvetica-Bold"
        },
        "font_sizes": {
            "title": 20,
            "invoice_number": 14,
            "section_header": 8,
            "table_header": 10,
            "normal_text": 9
        },
        "layout": {
            "page_size": "A4",
            "margin_top": 0.3,
            "margin_right": 0.5,
            "margin_bottom": 0.5,
            "margin_left": 0.5
        }
    },
    "modern": {
        "colors": {
            "primary": "#2C3E50",
            "secondary": "#7F8C8D",
            "accent": "#3498DB",
            "text": "#000000",
            "background": "#FFFFFF"
        },
        "fonts": {
            "main": "Helvetica",
            "accent": "Helvetica-Bold"
        },
        "font_sizes": {
            "title": 20,
            "invoice_number": 14,
            "section_header": 8,
            "table_header": 10,
            "normal_text": 9
        },
        "layout": {
            "page_size": "A4",
            "margin_top": 0.4,
            "margin_right": 0.6,
            "margin_bottom": 0.4,
            "margin_left": 0.6
        }
    },
    "classic": {
        "colors": {
            "primary": "#4A4A4A",
            "secondary": "#A9A9A9",
            "accent": "#8B0000",
            "text": "#000000",
            "background": "#FFFFFF"
        },
        "fonts": {
            "main": "Times-Roman",
            "accent": "Times-Bold"
        },
        "font_sizes": {
            "title": 20,
            "invoice_number": 14,
            "section_header": 8,
            "table_header": 10,
            "normal_text": 9
        },
        "layout": {
            "page_size": "LETTER",
            "margin_top": 0.5,
            "margin_right": 0.5,
            "margin_bottom": 0.5,
            "margin_left": 0.5
        }
    }
}


async def create_or_update_default_templates(db: AsyncSession):
    for name, config in DEFAULT_TEMPLATES.items():
        template_name = name.capitalize()
        template_data = {
            "name": template_name,
            "is_default": True,
            **config
        }
        result = await db.execute(select(Template).filter(Template.name == template_name))
        db_template = result.scalar_one_or_none()
        if db_template:
            for key, value in template_data.items():
                if key != 'id':
                    setattr(db_template, key, value)
        else:
            db_template = Template(**template_data)
            db.add(db_template)
    
    try:
        await db.commit()
        logger.info("Default templates created or updated successfully")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating or updating default templates: {str(e)}")
        raise


async def create_template(db: AsyncSession, template: TemplateCreate, user_id: int):
    db_template = Template(**template.model_dump(), user_id=user_id)
    db.add(db_template)
    try:
        await db.commit()
        await db.refresh(db_template)
        logger.info(f"Template created: id={db_template.id}, user_id={user_id}")
        return db_template
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating template: {str(e)}")
        raise TemplateAlreadyExistsException()


@lru_cache(maxsize=128)
async def get_template(db: AsyncSession, template_id: int, user_id: int):
    query = select(Template).filter(
        Template.id == template_id,
        or_(Template.user_id == user_id, Template.is_default == True),
        Template.is_deleted == False
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()


@lru_cache(maxsize=128)
async def get_templates(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100, sort_by: str | None = None, sort_order: str = 'asc'):
    query = select(Template).filter(
        or_(Template.user_id == user_id, Template.is_default == True),
        Template.is_deleted == False
    )
    
    if sort_by:
        order_func = func.asc if sort_order == 'asc' else func.desc
        query = query.order_by(order_func(getattr(Template, sort_by)))
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


async def update_template(db: AsyncSession, template_id: int, template: TemplateUpdate, user_id: int):
    db_template = await get_template(db, template_id, user_id)
    if not db_template:
        raise TemplateNotFoundException()
    
    for key, value in template.model_dump(exclude_unset=True).items():
        setattr(db_template, key, value)
    
    try:
        await db.commit()
        await db.refresh(db_template)
        logger.info(f"Template updated: id={template_id}, user_id={user_id}")
        get_template.cache_clear()  # Clear the cache for this template
        get_templates.cache_clear()  # Clear the cache for all templates
        return db_template
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating template: {str(e)}")
        raise TemplateAlreadyExistsException()


async def copy_template(db: AsyncSession, template_id: int, user_id: int):
    template = await get_template(db, template_id, user_id)
    if not template:
        raise TemplateNotFoundException()
    
    new_template = Template(
        name=f"Copy of {template.name}",
        is_default=False,
        user_id=user_id,
        colors=template.colors,
        fonts=template.fonts,
        font_sizes=template.font_sizes,
        layout=template.layout,
        custom_css=template.custom_css
    )
    
    db.add(new_template)
    try:
        await db.commit()
        await db.refresh(new_template)
        logger.info(f"Template copied: original_id={template_id}, new_id={new_template.id}, user_id={user_id}")
        get_templates.cache_clear()  # Clear the cache for all templates
        return new_template
    except Exception as e:
        await db.rollback()
        logger.error(f"Error copying template: {str(e)}")
        raise


async def delete_template(db: AsyncSession, template_id: int, user_id: int) -> Template:
    db_template = await get_template(db, template_id, user_id)
    if not db_template:
        logger.error(f"Template deletion failed: template not found, id={template_id}, user_id={user_id}")
        raise TemplateNotFoundException()
    
    if db_template.is_default:
        logger.error(f"Template deletion failed: cannot delete default template, id={template_id}, user_id={user_id}")
        raise ValueError("Cannot delete default template")
    
    await db.delete(db_template)
    await db.commit()
    logger.info(f"Template deleted: id={template_id}, user_id={user_id}")
    get_template.cache_clear()  # Clear the cache for this template
    get_templates.cache_clear()  # Clear the cache for all templates
    return db_template


async def soft_delete_template(db: AsyncSession, template_id: int, user_id: int):
    db_template = await get_template(db, template_id, user_id)
    if not db_template:
        raise TemplateNotFoundException()
    
    db_template.is_deleted = True
    db_template.deleted_at = datetime.now(timezone.utc)
    try:
        await db.commit()
        logger.info(f"Template soft deleted: id={template_id}, user_id={user_id}")
        get_template.cache_clear()
        get_templates.cache_clear()
        return db_template
    except Exception as e:
        await db.rollback()
        logger.error(f"Error soft deleting template: {str(e)}")
        raise


async def purge_deleted_templates(db: AsyncSession, days: int = 30):
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    query = delete(Template).where(Template.is_deleted == True, Template.deleted_at <= cutoff_date)
    try:
        result = await db.execute(query)
        await db.commit()
        logger.info(f"Purged {result.rowcount} templates deleted more than {days} days ago")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error purging deleted templates: {str(e)}")
        raise