from sqlalchemy.orm import Session
from ..models.template import Template
from ..schemas.template import TemplateCreate, TemplateUpdate

DEFAULT_TEMPLATES = {
    "default": {
        "colors": {
            "primary": "#000000",
            "secondary": "#555555",
            "accent": "#444444"
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
            "title": 24,
            "invoice_number": 16,
            "section_header": 12,
            "normal_text": 10
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
            "title": 22,
            "invoice_number": 14,
            "section_header": 11,
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
    default_templates = [
        {
            "name": "Default",
            "is_default": True,
            "colors": {
                "primary": "#000000",
                "secondary": "#555555",
                "accent": "#444444"
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
        {
            "name": "Modern",
            "is_default": True,
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
                "title": 24,
                "invoice_number": 16,
                "section_header": 12,
                "table_header": 14,
                "normal_text": 10
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 0.4,
                "margin_right": 0.6,
                "margin_bottom": 0.4,
                "margin_left": 0.6
            }
        },
        {
            "name": "Classic",
            "is_default": True,
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
                "title": 22,
                "invoice_number": 14,
                "section_header": 11,
                "table_header": 12,
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
    ]
    
    for template_data in default_templates:
        db_template = db.query(Template).filter(Template.name == template_data["name"]).first()
        if not db_template:
            db_template = Template(**template_data)
            db.add(db_template)
    
    db.commit()

def create_template(db: Session, template: TemplateCreate, user_id: int):
    db_template = Template(**template.model_dump(), user_id=user_id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def get_template(db: Session, template_id: int, user_id: int | None = None):
    query = db.query(Template).filter(Template.id == template_id)
    if user_id is not None:
        query = query.filter((Template.user_id == user_id) | (Template.is_default == True))
    else:
        query = query.filter(Template.is_default == True)
    return query.first()

def get_templates(db: Session, user_id: int | None = None, skip: int = 0, limit: int = 100):
    query = db.query(Template)
    if user_id:
        query = query.filter((Template.user_id == user_id) | (Template.is_default == True))
    else:
        query = query.filter(Template.is_default == True)
    return query.offset(skip).limit(limit).all()

def update_template(db: Session, template_id: int, template: TemplateUpdate, user_id: int):
    db_template = get_template(db, template_id, user_id)
    if db_template:
        if db_template.is_default:
            # If it's a default template, create a copy for the user
            db_template = copy_template(db, template_id, user_id)
            if db_template is None:
                return None
        
        for key, value in template.dict(exclude_unset=True).items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int, user_id: int):
    db_template = get_template(db, template_id, user_id)
    if db_template and not db_template.is_default:
        db.delete(db_template)
        db.commit()
    return db_template

def get_or_create_default_templates(db: Session, user_id: int):
    existing_templates = get_templates(db, user_id)
    existing_template_names = {t.name for t in existing_templates}
    
    for name, config in DEFAULT_TEMPLATES.items():
        if name not in existing_template_names:
            create_template(db, TemplateCreate(name=name, **config), user_id)
    
    return get_templates(db, user_id)