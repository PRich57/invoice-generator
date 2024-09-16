import logging

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.exceptions import (TemplateAlreadyExistsException,
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
            "accent": "#3498DB"
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
            "accent": "#8B0000"
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


def create_default_templates(db: Session):
    for name, config in DEFAULT_TEMPLATES.items():
        template_data = {
            "name": name.capitalize(),
            "is_default": True,
            **config
        }
        db_template = db.query(Template).filter(Template.name == template_data["name"]).first()
        if not db_template:
            db_template = Template(**template_data)
            db.add(db_template)
    
    try:
        db.commit()
        logger.info("Default templates created successfully")
    except IntegrityError:
        db.rollback()
        logger.error("Error creating default templates")
        raise


def create_template(db: Session, template: TemplateCreate, user_id: int):
    try:
        db_template = Template(**template.model_dump(), user_id=user_id)
        db.add(db_template)
        db.commit()
        db.refresh(db_template)
        logger.info(f"Template created: id={db_template.id}, user_id={user_id}")
        return db_template
    except IntegrityError:
        db.rollback()
        logger.error(f"Template creation failed: name already exists, user_id={user_id}")
        raise TemplateAlreadyExistsException()


def get_template(db: Session, template_id: int, user_id: int | None = None) -> Template | None:
    query = db.query(Template).filter(Template.id == template_id)
    if user_id is not None:
        query = query.filter((Template.user_id == user_id) | (Template.is_default == True))
    else:
        query = query.filter(Template.is_default == True)
    return query.first()


def get_templates(db: Session, user_id: int | None = None, skip: int = 0, limit: int = 100) -> list[Template]:
    query = db.query(Template)
    if user_id:
        query = query.filter((Template.user_id == user_id) | (Template.is_default == True))
    else:
        query = query.filter(Template.is_default == True)
    return query.offset(skip).limit(limit).all()


def update_template(db: Session, template_id: int, template: TemplateUpdate, user_id: int) -> Template:
    db_template = get_template(db, template_id, user_id)
    if not db_template:
        logger.error(f"Template update failed: template not found, id={template_id}, user_id={user_id}")
        raise TemplateNotFoundException()
    
    if db_template.is_default:
        db_template = copy_template(db, template_id, user_id)
    
    for key, value in template.model_dump(exclude_unset=True).items():
        setattr(db_template, key, value)
    
    try:
        db.commit()
        db.refresh(db_template)
        logger.info(f"Template updated: id={template_id}, user_id={user_id}")
        return db_template
    except IntegrityError:
        db.rollback()
        logger.error(f"Template update failed: integrity error, id={template_id}, user_id={user_id}")
        raise TemplateAlreadyExistsException()


def delete_template(db: Session, template_id: int, user_id: int) -> Template:
    db_template = get_template(db, template_id, user_id)
    if not db_template:
        logger.error(f"Template deletion failed: template not found, id={template_id}, user_id={user_id}")
        raise TemplateNotFoundException()
    
    if db_template.is_default:
        logger.error(f"Template deletion failed: cannot delete default template, id={template_id}, user_id={user_id}")
        raise ValueError("Cannot delete default template")
    
    db.delete(db_template)
    db.commit()
    logger.info(f"Template deleted: id={template_id}, user_id={user_id}")
    return db_template


def copy_template(db: Session, template_id: int, user_id: int) -> Template:
    template = get_template(db, template_id)
    if not template:
        logger.error(f"Template copy failed: template not found, id={template_id}")
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
    db.commit()
    db.refresh(new_template)
    logger.info(f"Template copied: original_id={template_id}, new_id={new_template.id}, user_id={user_id}")
    return new_template


def get_or_create_default_templates(db: Session, user_id: int):
    existing_templates = get_templates(db, user_id)
    existing_template_names = {t.name.lower() for t in existing_templates}
    
    for name, config in DEFAULT_TEMPLATES.items():
        if name not in existing_template_names:
            create_template(db, TemplateCreate(name=name.capitalize(), **config), user_id)
    
    return get_templates(db, user_id)