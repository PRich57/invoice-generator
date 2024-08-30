from fastapi import APIRouter, Depends, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import (InvoiceNotFoundException,
                               InvoiceNumberAlreadyExistsException,
                               TemplateNotFoundException)
from ..database import get_db
from ..schemas.invoice import Invoice, InvoiceCreate
from ..schemas.user import User
from ..services import invoice_service, template_service

router = APIRouter()

@router.post("/", response_model=Invoice)
def create_invoice(
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return invoice_service.create_invoice(db, invoice, current_user.id)
    except IntegrityError:
        raise InvoiceNumberAlreadyExistsException()

@router.get("/", response_model=list[Invoice])
def read_invoices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoices = invoice_service.get_invoices(db, current_user.id, skip=skip, limit=limit)
    return invoices

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = invoice_service.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    return db_invoice

@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice(
    invoice_id: int,
    invoice: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = invoice_service.update_invoice(db, invoice_id, invoice, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    return db_invoice

@router.delete("/{invoice_id}", response_model=Invoice)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = invoice_service.delete_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    return db_invoice

@router.post("/{invoice_id}/regenerate")
def regenerate_invoice(
    invoice_id: int,
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = invoice_service.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()

    template = template_service.get_template(db, template_name, current_user.id)
    if template is None:
        raise TemplateNotFoundException()

    pdf = invoice_service.regenerate_invoice(db_invoice, template)
    return Response(content=pdf, media_type="application/pdf")