from fastapi import APIRouter, Depends
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import (TemplateAlreadyExistsException,
                               TemplateNotFoundException)
from ..database import get_db
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..schemas.user import User
from ..services.template import crud


router = APIRouter()


@router.post("/", response_model=Template)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return crud.create_template(db, template, current_user.id)
    except IntegrityError:
        raise TemplateAlreadyExistsException()


@router.get("/", response_model=list[Template])
def read_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    templates = crud.get_templates(db, current_user.id, skip=skip, limit=limit)
    return templates


@router.get("/{template_id}", response_model=Template)
def read_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = crud.get_template(db, template_id, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    return db_template


@router.put("/{template_id}", response_model=Template)
def update_template(
    template_id: int,
    template: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = crud.update_template(db, template_id, template, current_user.id)
    if db_template is None or not db_template.is_default:
        raise TemplateNotFoundException()
    return db_template


@router.put("/{template_id}/customize", response_model=Template)
def customize_template(
    template_id: int,
    template_update: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = crud.get_template(db, template_id, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    
    if db_template.is_default:
        # Create a new custom template based on the default one
        new_template = crud.copy_template(db, template_id, current_user.id)
        db_template = new_template
    
    updated_template = crud.update_template(db, db_template.id, template_update, current_user.id)
    return updated_template


@router.delete("/{template_id}", response_model=Template)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = crud.delete_template(db, template_id, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    return db_template