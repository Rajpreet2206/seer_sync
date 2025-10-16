from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    google_id: str
    picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    google_id: str
    picture: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True