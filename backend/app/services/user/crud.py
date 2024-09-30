import secrets

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.security import get_password_hash, verify_password
from ...models.refresh_token import RefreshToken
from ...models.user import User
from ...schemas.user import UserCreate


async def get_user(db: AsyncSession, user_id: int):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


async def create_refresh_token(db: AsyncSession, user_id: int) -> str:
    token = secrets.token_urlsafe()
    db_token = RefreshToken(user_id=user_id, token=token)
    db.add(db_token)
    await db.commit()
    return token


async def get_refresh_token(db: AsyncSession, token: str):
    result = await db.execute(select(RefreshToken).filter(RefreshToken.token == token))
    return result.scalar_one_or_none()


async def rotate_refresh_token(db: AsyncSession, old_token: RefreshToken) -> str:
    new_token = secrets.token_urlsafe()
    old_token.token = new_token
    old_token.created_at = func.now()
    await db.commit()
    return new_token


async def invalidate_refresh_tokens(db: AsyncSession, user_id: int):
    await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    await db.commit()


def is_active(user: User) -> bool:
    return True