from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate, UserResponse
from typing import Dict
import uuid
from datetime import datetime

router = APIRouter()

# Temporary in-memory storage (will be replaced with database)
users_db: Dict[str, dict] = {}

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # Check if user already exists
    existing_user = next(
        (u for u in users_db.values() if u["google_id"] == user.google_id),
        None
    )
    
    if existing_user:
        return existing_user
    
    # Create new user
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "google_id": user.google_id,
        "picture": user.picture,
        "created_at": datetime.now()
    }
    
    users_db[user_id] = new_user
    return new_user

@router.get("/me", response_model=UserResponse)
async def get_current_user(google_id: str):
    user = next(
        (u for u in users_db.values() if u["google_id"] == google_id),
        None
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/users")
async def list_users():
    return {"users": list(users_db.values()), "count": len(users_db)}