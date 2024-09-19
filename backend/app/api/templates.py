import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.deps import get_current_user
from ..core.exceptions import (TemplateAlreadyExistsException,
                               TemplateNotFoundException)
from ..database import get_async_db
from ..schemas.template import Template, TemplateCreate, TemplateUpdate
from ..schemas.user import User
from ..services.template import crud


logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=Template)
async def create_template(
    template: TemplateCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Creating template for user {current_user.id}")
        return await crud.create_template(db, template, current_user.id)
    except TemplateAlreadyExistsException as e:
        logger.error(f"Template creation failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[Template])
async def read_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    sort_by: str | None = Query(None, enum=['name', 'created_at']),
    sort_order: str = Query('asc', enum=['asc', 'desc']),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Fetching templates for user {current_user.id}")
    return await crud.get_templates(db, current_user.id, skip=skip, limit=limit, sort_by=sort_by, sort_order=sort_order)


@router.get("/{template_id}", response_model=Template)
async def read_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Fetching template {template_id} for user {current_user.id}")
    db_template = await crud.get_template(db, template_id, current_user.id)
    if db_template is None:
        logger.error(f"Template {template_id} not found for user {current_user.id}")
        raise TemplateNotFoundException()
    return db_template


@router.put("/{template_id}", response_model=Template)
async def update_template(
    template_id: int,
    template: TemplateUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Updating template {template_id} for user {current_user.id}")
    db_template = await crud.update_template(db, template_id, template, current_user.id)
    if db_template is None:
        logger.error(f"Template {template_id} not found for user {current_user.id}")
        raise TemplateNotFoundException()
    return db_template


@router.put("/{template_id}/customize", response_model=Template)
async def customize_template(
    template_id: int,
    template_update: TemplateUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Customizing template {template_id} for user {current_user.id}")
    db_template = await crud.get_template(db, template_id, current_user.id)
    if db_template is None:
        logger.error(f"Template {template_id} not found for user {current_user.id}")
        raise TemplateNotFoundException()
    
    if db_template.is_default:
        new_template = await crud.copy_template(db, template_id, current_user.id)
        db_template = new_template
    
    updated_template = await crud.update_template(db, db_template.id, template_update, current_user.id)
    return updated_template


@router.delete("/{template_id}", response_model=Template)
async def delete_template(
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Deleting template {template_id} for user {current_user.id}")
    db_template = await crud.delete_template(db, template_id, current_user.id)
    if db_template is None:
        logger.error(f"Template {template_id} not found for user {current_user.id}")
        raise TemplateNotFoundException()
    return db_template