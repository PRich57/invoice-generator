from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_async_db
from ..core.config import settings
from ..services.user import crud

class OAuth2PasswordBearerWithCookie(OAuth2):
    def __init__(self, tokenUrl: str):
        super().__init__(auto_error=False)
        self.tokenUrl = tokenUrl

    async def __call__(self, request: Request) -> str | None:
        return request.cookies.get("access_token")

oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = token.split("Bearer ")[-1] if token else None  # Remove 'Bearer ' prefix if present
        if not token:
            raise credentials_exception
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_optional(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_async_db)):
    if not token:
        return None
    try:
        token = token.split("Bearer ")[-1]
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = await crud.get_user_by_email(db, email=email)
    return user