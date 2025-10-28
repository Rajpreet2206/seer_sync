from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.db.session import get_db
import uuid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.google_id == user.google_id).first()
    
    if existing_user:
        return existing_user
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=user.email,
        name=user.name,
        google_id=user.google_id,
        picture=user.picture
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.get("/me", response_model=UserResponse)
async def get_current_user(google_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.google_id == google_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {"users": users, "count": len(users)}

@router.get("/by-google-id")
def get_user_by_google_id(google_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "name": user.name}