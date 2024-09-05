from fastapi import APIRouter, Body, Depends, HTTPException, Response
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
from ..services import invoice_service, template_service, pdf_service

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
    try:
        return invoice_service.create_invoice(db, invoice, current_user.id)
    except (InvoiceNumberAlreadyExistsException, ContactNotFoundException, InvalidContactIdException, InvalidInvoiceNumberException, TemplateNotFoundException) as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

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

@router.get("/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: int,
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = invoice_service.get_invoice(db, invoice_id, current_user.id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    template = template_service.get_template(db, template_id, current_user.id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    pdf_content = pdf_service.generate_pdf(invoice, template)
    
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
    db_invoice = invoice_service.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise InvoiceNotFoundException()

    template = template_service.get_template(db, template_name, current_user.id)
    if template is None:
        raise TemplateNotFoundException()

    pdf = invoice_service.regenerate_invoice(db_invoice, template)
    return Response(content=pdf, media_type="application/pdf")