from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from ..core.config import settings
from ..core.security import create_access_token, get_current_user
from ..database import get_db
from ..schemas.user import User, UserCreate
from ..services.user import crud


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.options("/register")
@router.options("/token")
async def auth_options():
    return {"message": "OK"}


@router.get("/me", response_model=User)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.post("/token")
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=14)
    refresh_token = create_access_token(
        data={"sub": user.email}, expires_delta=refresh_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        expires=access_token_expires,
        samesite='lax',
        secure=settings.PRODUCTION
    )
    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {refresh_token}",
        httponly=True,
        expires=refresh_token_expires,
        samesite='lax',
        secure=settings.PRODUCTION
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh")
async def refresh_access_token(response: Response, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    # Verify the refresh token
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    
    # Generate a new access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)
    
    # Update the access token in the cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        expires=access_token_expires,
        samesite='lax',
        secure=settings.PRODUCTION
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/status")
async def auth_status(current_user: User = Depends(get_current_user)):
    return {"status": "authenticated"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "success"}