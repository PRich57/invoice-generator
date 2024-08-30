from sqlalchemy.orm import Session

from ..models.template import Template
from ..schemas.template import TemplateCreate, TemplateUpdate


def get_template(db: Session, template_name: str, user_id: int):
    return db.query(Template).filter(Template.name == template_name, Template.user_id == user_id).first()

def get_templates(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(Template).filter(Template.user_id == user_id).offset(skip).limit(limit).all()

def create_template(db: Session, template: TemplateCreate, user_id: int):
    db_template = Template(**template.model_dump(), user_id=user_id)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(db: Session, template_name: str, template: TemplateUpdate, user_id: int):
    db_template = get_template(db, template_name, user_id)
    if db_template is None:
        return None
    
    for key, value in template.model_dump(exclude_unset=True).items():
        setattr(db_template, key, value)
    
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_name: str, user_id: int):
    db_template = get_template(db, template_name, user_id)
    if db_template is None:
        return None
    
    db.delete(db_template)
    db.commit()
    return db_template