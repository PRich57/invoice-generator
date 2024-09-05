from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..core.config import settings
from ..database import get_db
from ..services import user_service

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    now = datetime.now(tz=timezone.utc)
    expire = now + expires_delta if expires_delta else now + timedelta(minutes=30)  # Default for access token
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

async def get_current_user(response: Response, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception

        expiration = payload.get("exp")
        time_left = datetime.fromtimestamp(expiration, tz=timezone.utc) - datetime.now(tz=timezone.utc)
        
        if time_left < timedelta(minutes=5):
            new_access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            new_access_token = create_access_token(data={"sub": email}, expires_delta=new_access_token_expires)
            
            response.set_cookie(
                key="access_token",
                value=f"Bearer {new_access_token}",
                httponly=True,
                expires=new_access_token_expires,
                samesite='lax',
                secure=settings.PRODUCTION
            )

    except JWTError:
        raise credentials_exception
    
    user = user_service.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user