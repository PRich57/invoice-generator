from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.invoice import Invoice, InvoiceItem
from ..schemas.invoice import InvoiceCreate, Invoice as InvoiceSchema

router = APIRouter()

@router.post("/invoices/", response_model=InvoiceSchema)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = Invoice(
        invoice_number=invoice.invoice_number,
        date_of_service=invoice.date_of_service,
        bill_to_id=invoice.bill_to_id,
        send_to_id=invoice.send_to_id,
        subtotal=invoice.subtotal,
        tax=invoice.tax,
        total=invoice.total
    )
    db.add(db_invoice)
    db.flush()

    for item in invoice.items:
        db_item = InvoiceItem(**item.dict(), invoice_id=db_invoice.id)
        db.add(db_item)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.get("/invoices/", response_model=list[InvoiceSchema])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    invoices = db.query(Invoice).offset(skip).limit(limit).all()
    return invoices

@router.get("/invoices/{invoice_id}", response_model=InvoiceSchema)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.put("/invoices/{invoice_id}", response_model=InvoiceSchema)
def update_invoice(invoice_id: int, invoice: InvoiceCreate, db: Session = Depends(get_db)):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    for key, value in invoice.dict(exclude={'items'}).items():
        setattr(db_invoice, key, value)
    
    # Delete existing items and add new ones
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice_id).delete()
    for item in invoice.items:
        db_item = InvoiceItem(**item.dict(), invoice_id=invoice_id)
        db.add(db_item)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice

@router.delete("/invoices/{invoice_id}", response_model=InvoiceSchema)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Fetch related data before deletion
    bill_to = db_invoice.bill_to
    send_to = db_invoice.send_to
    
    # Create a copy of the invoice data to be returned after deletion
    invoice_data = InvoiceSchema(
        id=db_invoice.id,
        invoice_number=db_invoice.invoice_number,
        date_of_service=db_invoice.date_of_service,
        bill_to_id=db_invoice.bill_to_id,
        send_to_id=db_invoice.send_to_id,
        subtotal=db_invoice.subtotal,
        tax=db_invoice.tax,
        total=db_invoice.total,
        bill_to=bill_to,
        send_to=send_to,
        items=db_invoice.items
    )
    
    # Delete invoice and related data
    db.delete(db_invoice)
    db.commit()
    
    return invoice_data