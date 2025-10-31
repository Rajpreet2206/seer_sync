from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
from uuid import uuid4

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    sender_id = Column(String, nullable=False)
    receiver_id = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())