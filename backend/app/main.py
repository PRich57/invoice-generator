import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.services.template import crud
from backend.app.services.template.crud import purge_deleted_templates

from .api import (auth_router, contacts_router, invoices_router,
                  templates_router)
from .core.exceptions import (ContactAlreadyExistsException,
                              ContactNotFoundException,
                              InvoiceNotFoundException,
                              InvoiceNumberAlreadyExistsException,
                              TemplateNotFoundException,
                              global_exception_handler)
from .database import engine, get_async_db
from .models import contact, invoice, template, user

logger = logging.getLogger(__name__)


scheduler = AsyncIOScheduler()


async def scheduled_purge():
    async for db in get_async_db():
        await purge_deleted_templates(db)


async def async_create_or_update_default_templates():
    async for db in get_async_db():
        await crud.create_or_update_default_templates(db)


# Create tables asynchronously
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(user.Base.metadata.create_all)
        await conn.run_sync(contact.Base.metadata.create_all)
        await conn.run_sync(invoice.Base.metadata.create_all)
        await conn.run_sync(template.Base.metadata.create_all)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    await create_tables()
    await async_create_or_update_default_templates()
    scheduler.add_job(scheduled_purge, CronTrigger(hour=0, minute=0))
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()
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