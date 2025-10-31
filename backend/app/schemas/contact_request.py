# schemas/contact_request.py
from pydantic import BaseModel

class ContactRequestCreate(BaseModel):
    sender_id: str
    receiver_email: str
