import logging
from datetime import date

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from ..core.deps import get_current_user
from ..core.exceptions import (ContactNotFoundException,
                               InvalidContactIdException,
                               InvalidInvoiceNumberException,
                               InvoiceNotFoundException,
                               InvoiceNumberAlreadyExistsException,
                               TemplateNotFoundException)
from ..database import get_db
from ..schemas.invoice import Invoice, InvoiceCreate
from ..schemas.user import User
from ..services.invoice import crud


logger = logging.getLogger(__name__)


router = APIRouter()


@router.post("/", response_model=Invoice)
def create_invoice(
    invoice: InvoiceCreate = Body(
        ...,
        example={
            "invoice_number": "#001",
            "invoice_date": "2024-01-01",
            "bill_to_id": 1,
            "send_to_id": 2,
            "tax_rate": 8.00,
            "notes": "This is a sample invoice.",
            "items": [
                {
                    "description": "Item 1", 
                    "quantity": 2,
                    "unit_price": 100.00,
                    "subitems": []
                },
            ]
        }
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    logger.info(f"Received invoice creation request: {invoice.model_dump()}")
    try:
        return crud.create_invoice(db, invoice, current_user.id)
    except (InvoiceNumberAlreadyExistsException, ContactNotFoundException, InvalidContactIdException, InvalidInvoiceNumberException, TemplateNotFoundException) as e:
        logger.error(f"Error creating invoice: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/preview-pdf")
async def preview_invoice_pdf(
    invoice: InvoiceCreate,
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    template = crud.get_template(db, template_id, current_user.id)
    if not template:
        raise TemplateNotFoundException()
    
    pdf_content = crud.generate_preview_pdf(db, invoice, template)
    
    return Response(content=pdf_content, media_type="application/pdf")


@router.get("/", response_model=list[Invoice])
def read_invoices(
    skip: int = 0,
    limit: int = 100,
    sort_by: str | None = Query(None, enum=['invoice_number', 'bill_to_name', 'send_to_name', 'date', 'total']),
    sort_order: str = Query('asc', enum=['asc', 'desc']),
    invoice_number: str | None = None,
    bill_to_name: str | None = None,
    send_to_name: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    total_min: float | None = None,
    total_max: float | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoices = crud.get_invoices(
        db, current_user.id, skip=skip, limit=limit,
        sort_by=sort_by, sort_order=sort_order,
        invoice_number=invoice_number, bill_to_name=bill_to_name,
        send_to_name=send_to_name, date_from=date_from, date_to=date_to,
        total_min=total_min, total_max=total_max
    )
    return invoices


@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = crud.get_invoice(db, invoice_id, current_user.id)
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
    db_invoice = crud.update_invoice(db, invoice_id, invoice, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    return db_invoice


@router.delete("/{invoice_id}", response_model=Invoice)
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = crud.delete_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()
    return db_invoice


@router.get("/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: int,
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf_content = crud.generate_invoice_pdf(db, invoice_id, template_id, current_user.id)
    
    return Response(content=pdf_content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"
    })


@router.post("/{invoice_id}/regenerate")
def regenerate_invoice(
    invoice_id: int,
    template_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = crud.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()

    template = crud.get_template(db, template_name, current_user.id)
    if template is None:
        raise TemplateNotFoundException()

    pdf = crud.regenerate_invoice(db_invoice, template)
    return Response(content=pdf, media_type="application/pdf")


@router.get("/grouped", response_model=dict)
def read_grouped_invoices(
    group_by: list[str] = Query(..., enum=['bill_to', 'send_to', 'month', 'year']),
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_grouped_invoices(db, current_user.id, group_by, date_from, date_to)