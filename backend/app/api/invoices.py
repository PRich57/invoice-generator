import logging
from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.invoice import Invoice, InvoiceStatusEnum
from backend.app.services.invoice.pdf import \
    generate_invoice_pdf as generate_invoice_pdf_file
from backend.app.services.invoice.pdf import \
    generate_preview_pdf as generate_preview_pdf_file
from backend.app.services.template.crud import get_template

from ..core.deps import get_current_user
from ..core.exceptions import (AlreadyExistsError, BadRequestError,
                               NotFoundError, ValidationError)
from ..database import get_async_db
from ..schemas.invoice import InvoiceCreate, InvoiceDetail, InvoiceListResponse, InvoiceSummary, InvoiceTotals
from ..schemas.user import User
from ..services.invoice import crud

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=InvoiceDetail)
async def create_invoice(
    invoice: InvoiceCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    
    logger.info(f"Received invoice creation request: {invoice.model_dump()}")
    try:
        if not invoice.invoice_number:
            raise ValidationError("invoice_number")
        return await crud.create_invoice(db, invoice, current_user.id)
    except AlreadyExistsError:
        raise AlreadyExistsError("invoice_number")


@router.get("/", response_model=InvoiceListResponse)
async def read_invoices(
    skip: int = 0,
    limit: int = 100,
    sort_by: Optional[str] = Query(None, enum=['invoice_number', 'bill_to_name', 'send_to_name', 'date', 'total', 'status', 'client_type', 'invoice_type']),
    sort_order: str = Query('desc', enum=['asc', 'desc']),
    group_by: List[str] = Query(default=[], enum=['bill_to', 'send_to', 'month', 'year', 'status', 'client_type', 'invoice_type']),
    invoice_number: Optional[str] = None,
    bill_to_name: Optional[str] = None,
    send_to_name: Optional[str] = None,
    client_type: Optional[str] = None,
    invoice_type: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    total_min: Optional[float] = None,
    total_max: Optional[float] = None,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    try:
        invoices, total_count = await crud.get_invoices(
            db, current_user.id, skip=skip, limit=limit,
            sort_by=sort_by, sort_order=sort_order, group_by=group_by,
            invoice_number=invoice_number, bill_to_name=bill_to_name,
            send_to_name=send_to_name, client_type=client_type,
            invoice_type=invoice_type, status=status,
            date_from=date_from, date_to=date_to,
            total_min=total_min, total_max=total_max
        )
        
        return InvoiceListResponse(items=invoices, total=total_count)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/totals", response_model=InvoiceTotals)
async def get_invoice_totals(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    try:
        total_count = await db.scalar(select(func.count()).where(Invoice.user_id == current_user.id))
        total_amount = await db.scalar(select(func.sum(Invoice.total)).where(Invoice.user_id == current_user.id))
        
        status_counts = {}
        for status in InvoiceStatusEnum:
            count = await db.scalar(
                select(func.count()).where(Invoice.user_id == current_user.id).where(Invoice.status == status)
            )
            status_counts[status.value] = count

        return InvoiceTotals(
            total_count=total_count,
            total_amount=total_amount,
            status_counts=status_counts
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/next-invoice-number")
async def get_next_invoice_number(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(func.max(Invoice.invoice_number))
        .filter(Invoice.user_id == current_user.id)
    )
    highest_number = result.scalar()
    
    if not highest_number:
        return {"next_invoice_number": "INV0001"}
    
    prefix = ''.join(filter(str.isalpha, highest_number))
    number = int(''.join(filter(str.isdigit, highest_number))) + 1
    
    next_number = f"{prefix}{number:04d}"
    
    return {"next_invoice_number": next_number}


@router.get("/{invoice_id}", response_model=InvoiceDetail)
async def read_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = await crud.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise NotFoundError("invoice")
    return db_invoice


@router.put("/{invoice_id}", response_model=InvoiceDetail)
async def update_invoice(
    invoice_id: int,
    invoice: InvoiceCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_invoice = await crud.update_invoice(db, invoice_id, invoice, current_user.id)
        return InvoiceDetail.model_validate(db_invoice)
    except NotFoundError:
        raise NotFoundError("invoice")
    except BadRequestError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


@router.delete("/{invoice_id}", response_model=InvoiceDetail)
async def delete_invoice(
    invoice_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = await crud.delete_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise NotFoundError("invoice")
    return db_invoice


@router.post("/preview-pdf")
async def preview_invoice_pdf(
    invoice: InvoiceCreate,
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    template = await get_template(db, template_id, current_user.id)
    if not template:
        raise NotFoundError("template")
    
    pdf_content = await generate_preview_pdf_file(db, invoice, template, current_user.id)
    return Response(content=pdf_content, media_type="application/pdf")


@router.get("/{invoice_id}/pdf")
async def get_invoice_pdf(
    invoice_id: int,
    template_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    pdf_content = await generate_invoice_pdf_file(db, invoice_id, template_id, current_user.id)
    return Response(content=pdf_content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf"
    })


@router.post("/{invoice_id}/regenerate")
async def regenerate_invoice(
    invoice_id: int,
    template_name: str,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    db_invoice = await crud.get_invoice(db, invoice_id, current_user.id)
    if db_invoice is None:
        raise NotFoundError("invoice")

    template = await get_template(db, template_name, current_user.id)
    if template is None:
        raise NotFoundError("template")

    pdf = await crud.regenerate_invoice(db_invoice, template)
    return Response(content=pdf, media_type="application/pdf")


@router.get("/grouped", response_model=dict)
async def read_grouped_invoices(
    group_by: List[str] = Query(..., enum=['bill_to', 'send_to', 'month', 'year', 'status', 'client_type', 'invoice_type']),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
):
    return await crud.get_grouped_invoices(db, current_user.id, group_by, date_from, date_to)
