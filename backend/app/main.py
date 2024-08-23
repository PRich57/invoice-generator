from fastapi import FastAPI
from .api import contacts, invoices
from .database import engine
from .models import contact, invoice

# Create tables
contact.Base.metadata.create_all(bind=engine)
invoice.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(contacts.router, prefix="/api/v1")
app.include_router(invoices.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Invoice Generator API"}