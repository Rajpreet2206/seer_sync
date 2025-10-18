from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.contact import ContactCreate, ContactResponse
from app.models.contact import Contact
from app.models.user import User
from app.db.session import get_db
import uuid

router = APIRouter()

@router.post("/add", response_model=ContactResponse)
async def add_contact(
    contact_data: ContactCreate,
    user_id: str,
    db: Session = Depends(get_db)
):
    # Get current user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Find contact by email
    contact_user = db.query(User).filter(User.email == contact_data.contact_email).first()
    if not contact_user:
        raise HTTPException(status_code=404, detail="Contact user not found. They need to sign up first.")
    
    # Check if trying to add self
    if contact_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot add yourself as a contact")
    
    # Check if contact already exists
    existing = db.query(Contact).filter(
        Contact.user_id == user_id,
        Contact.contact_user_id == contact_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Contact already exists")
    
    # Create new contact
    new_contact = Contact(
        id=str(uuid.uuid4()),
        user_id=user_id,
        contact_user_id=contact_user.id,
        status="accepted"  # Auto-accept for now
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    return ContactResponse(
        id=new_contact.id,
        user_id=new_contact.user_id,
        contact_user_id=new_contact.contact_user_id,
        status=new_contact.status,
        contact_name=contact_user.name,
        contact_email=contact_user.email,
        contact_picture=contact_user.picture,
        created_at=new_contact.created_at
    )

@router.get("/list", response_model=list[ContactResponse])
async def list_contacts(user_id: str, db: Session = Depends(get_db)):
    contacts = db.query(Contact).filter(Contact.user_id == user_id).all()
    
    result = []
    for contact in contacts:
        contact_user = db.query(User).filter(User.id == contact.contact_user_id).first()
        if contact_user:
            result.append(ContactResponse(
                id=contact.id,
                user_id=contact.user_id,
                contact_user_id=contact.contact_user_id,
                status=contact.status,
                contact_name=contact_user.name,
                contact_email=contact_user.email,
                contact_picture=contact_user.picture,
                created_at=contact.created_at
            ))
    
    return result

@router.delete("/{contact_id}")
async def delete_contact(contact_id: str, user_id: str, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user_id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(contact)
    db.commit()
    
    return {"message": "Contact deleted successfully"}