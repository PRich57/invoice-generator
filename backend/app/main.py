import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.services.template import crud
from backend.app.services.template.crud import purge_deleted_templates

from .api import (auth_router, contacts_router, invoices_router,
                  templates_router)
from .core.exceptions import (AppException, app_exception_handler,
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
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)


# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(contacts_router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(invoices_router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(templates_router, prefix="/api/v1/templates", tags=["templates"])


@app.get("/")
async def root():
    return {"message": "Welcome to the Invoice Generator API"}