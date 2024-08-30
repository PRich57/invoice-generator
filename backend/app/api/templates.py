from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import TemplateNotFoundException
from ..database import get_db
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..schemas.user import User
from ..services import template_service

router = APIRouter()

@router.post("/", response_model=Template)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return template_service.create_template(db, template, current_user.id)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Template with this name already exists")

@router.get("/", response_model=list[Template])
def read_templates(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    templates = template_service.get_templates(db, current_user.id, skip=skip, limit=limit)
    return templates

@router.get("/{template_name}", response_model=Template)
def read_template(
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = template_service.get_template(db, template_name, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    return db_template

@router.put("/{template_name}", response_model=Template)
def update_template(
    template_name: str,
    template: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = template_service.update_template(db, template_name, template, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    return db_template

@router.delete("/{template_name}", response_model=Template)
def delete_template(
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_template = template_service.delete_template(db, template_name, current_user.id)
    if db_template is None:
        raise TemplateNotFoundException()
    return db_template