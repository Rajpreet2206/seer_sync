from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ContactBase(BaseModel):
    contact_email: EmailStr

class ContactCreate(ContactBase):
    pass

class ContactResponse(BaseModel):
    id: str
    user_id: str
    contact_user_id: str
    status: str
    contact_name: str
    contact_email: str
    contact_picture: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True