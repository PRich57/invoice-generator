from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models.invoice import Invoice as InvoiceModel, InvoiceItem as InvoiceItemModel
from ..schemas.invoice import Invoice, InvoiceCreate

router = APIRouter()

@router.post("/", response_model=Invoice)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = InvoiceModel(
        invoice_number=invoice.invoice_number,
        date_of_service=invoice.date_of_service,
        bill_to_id=invoice.bill_to_id,
        send_to_id=invoice.send_to_id,
        tax_rate=invoice.tax_rate,
        manual_total=invoice.manual_total,
        notes=invoice.notes
    )
    try:
        db.add(db_invoice)
        db.flush()  # This assigns an ID to db_invoice without committing the transaction

        for item in invoice.items:
            db_item = InvoiceItemModel(
                invoice_id=db_invoice.id,
                description=item.description,
                quantity=item.quantity,
                rate=item.rate
            )
            db.add(db_item)

        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invoice number already exists")

@router.get("/", response_model=list[Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    invoices = db.query(InvoiceModel).offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice(invoice_id: int, invoice: InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Update invoice fields
    for key, value in invoice.model_dump(exclude={'items'}).items():
        setattr(db_invoice, key, value)
    
    # Update invoice items
    db.query(InvoiceItemModel).filter(InvoiceItemModel.invoice_id == invoice_id).delete()
    for item in invoice.items:
        db_item = InvoiceItemModel(
            invoice_id=invoice_id,
            description=item.description,
            quantity=item.quantity,
            rate=item.rate
        )
        db.add(db_item)
    
    try:
        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invoice number already exists")

@router.delete("/{invoice_id}", response_model=Invoice)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    db.delete(db_invoice)
    db.commit()
    return db_invoice