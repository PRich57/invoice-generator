from fastapi import HTTPException, status
from fastapi.responses import JSONResponse


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class ValidationError(AppException):
    def __init__(self, field: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, 
                         detail=f"The {field} field is required.")


class NotFoundError(AppException):
    def __init__(self, item: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, 
                         detail=f"The requested {item} was not found.")


class AlreadyExistsError(AppException):
    def __init__(self, item: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, 
                         detail=f"A {item} with this identifier already exists.")


class InvalidIdError(AppException):
    def __init__(self, field: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, 
                         detail=f"Invalid {field} ID. It must be a positive integer.")


class BadRequestError(AppException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        
        
class UnauthorizedError(AppException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED,
                         detail="Could not validate credentials")


async def app_exception_handler(request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )


async def global_exception_handler(request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.detail}
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred"}
    )