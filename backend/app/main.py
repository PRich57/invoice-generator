from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from backend.app.services import template_service

from .api import (auth_router, contacts_router, invoices_router,
                  templates_router)
from .core.exceptions import (ContactAlreadyExistsException,
                              ContactNotFoundException,
                              InvoiceNotFoundException,
                              InvoiceNumberAlreadyExistsException,
                              TemplateNotFoundException)
from .database import SessionLocal, engine
from .models import contact, invoice, template, user

logger = logging.getLogger(__name__)

# Create tables
user.Base.metadata.create_all(bind=engine)
contact.Base.metadata.create_all(bind=engine)
invoice.Base.metadata.create_all(bind=engine)
template.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    db = SessionLocal()
    template_service.create_default_templates(db)
    db.close()
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(ContactNotFoundException)
async def contact_not_found_exception_handler(request: Request, exc: ContactNotFoundException):
    logger.warning(f"Contact not found: {str(exc)}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(ContactAlreadyExistsException)
async def contact_already_exists_exception_handler(request: Request, exc: ContactAlreadyExistsException):
    logger.warning(f"Contact already exists: {str(exc)}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(InvoiceNotFoundException)
async def invoice_not_found_exception_handler(request: Request, exc: InvoiceNotFoundException):
    logger.warning(f"Invoice not found: {str(exc)}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(InvoiceNumberAlreadyExistsException)
async def invoice_number_already_exists_exception_handler(request: Request, exc: InvoiceNumberAlreadyExistsException):
    logger.warning(f"Invoice number already exists: {str(exc)}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(TemplateNotFoundException)
async def template_not_found_exception_handler(request: Request, exc: TemplateNotFoundException):
    logger.warning(f"Template not found: {str(exc)}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )
    
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"An unexpected error occurred: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred"},
    )

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(contacts_router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(invoices_router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(templates_router, prefix="/api/v1/templates", tags=["templates"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Invoice Generator API"}