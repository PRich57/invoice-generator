from fastapi import HTTPException, status


class ContactNotFoundException(HTTPException):
    def __init__(self, contact_type: str, contact_id: int):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{contact_type} contact with id {contact_id} does not exist")

class ContactAlreadyExistsException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="Contact with this email already exists")
        
class InvalidContactIdException(HTTPException):
    def __init__(self, field: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {field} ID. Contact ID must be a positive integer.")

class InvoiceNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")

class InvoiceNumberAlreadyExistsException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice number already exists")
        
class InvalidInvoiceNumberException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invoice number. Please provide a proper invoice number.")

class TemplateNotFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
        
class TemplateAlreadyExistsException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail="A template with this name already exists")

class BadRequestException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)