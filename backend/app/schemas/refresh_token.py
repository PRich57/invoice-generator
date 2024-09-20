from pydantic import BaseModel
from datetime import datetime

class RefreshTokenBase(BaseModel):
    token: str
    user_id: int

class RefreshTokenCreate(RefreshTokenBase):
    pass

class RefreshToken(RefreshTokenBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True