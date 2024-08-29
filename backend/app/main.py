from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from .api import contacts, invoices
from .database import engine
from .models import contact, invoice
from .core.exceptions import ContactNotFoundException, ContactAlreadyExistsException

# Create tables
contact.Base.metadata.create_all(bind=engine)
invoice.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.exception_handler(ContactNotFoundException)
async def contact_not_found_exception_handler(request: Request, exc: ContactNotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(ContactAlreadyExistsException)
async def contact_already_exists_exception_handler(request: Request, exc: ContactAlreadyExistsException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

app.include_router(contacts.router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["invoices"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Invoice Generator API"}