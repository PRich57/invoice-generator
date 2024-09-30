from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.exceptions import AlreadyExistsError, NotFoundError, UnauthorizedError, ValidationError
from ..core.security import create_access_token, create_refresh_token
from ..core.deps import get_current_user_optional
from ..database import get_async_db
from ..schemas.user import User, UserCreate
from ..schemas.auth import LoginRequest
from ..services.user import crud

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_async_db)):
    if not user.email:
        raise ValidationError("email")
    if not user.password:
        raise ValidationError("password")
    db_user = await crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise AlreadyExistsError("user")
    return await crud.create_user(db=db, user=user)

@router.post("/login")
async def login_for_access_token(
    response: Response,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_async_db),
):
    user = await crud.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise UnauthorizedError()
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = await create_refresh_token(db, user.id)
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite='lax',
        secure=settings.PRODUCTION,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        expires=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite='lax',
        secure=settings.PRODUCTION,
    )
    
    return {"message": "Login successful"}


@router.post("/refresh")
async def refresh_access_token(
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    
    db_refresh_token = await crud.get_refresh_token(db, refresh_token)
    if not db_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    user = await crud.get_user(db, db_refresh_token.user_id)
    if not user:
        raise NotFoundError("user")
    
    access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = await crud.rotate_refresh_token(db, db_refresh_token)
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        samesite='lax',
        secure=settings.PRODUCTION,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        expires=settings.refresh_token_expire_days * 24 * 60 * 60,
        samesite='lax',
        secure=settings.PRODUCTION,
    )
    
    return {"message": "Token refreshed successfully"}


@router.post("/logout")
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user_optional),
):
    if current_user:
        await crud.invalidate_refresh_tokens(db, current_user.id)
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "success"}