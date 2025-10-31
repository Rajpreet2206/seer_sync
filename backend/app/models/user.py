# app/models/user.py
import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base  # <-- use the same Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    google_id = Column(String, unique=True)
    picture = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    gmail_access_token = Column(String)
    gmail_refresh_token = Column(String)
