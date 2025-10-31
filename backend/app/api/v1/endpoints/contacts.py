from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.contact import ContactCreate, ContactResponse, InviteCreate, InviteResponse
from app.models.contact import Contact
from app.models.user import User
from app.models.invite import Invite
from app.db.session import get_db
from app.services.email_service import email_service
from uuid import uuid4
from app.models.contact_request import ContactRequest
from app.schemas.contact_request import ContactRequestCreate

router = APIRouter()

@router.get("/by-google-id")
def get_user_by_google_id(google_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "name": user.name}

@router.get("/test")
def test_route():
    return {"message": "contacts router works"}

# -------------------------------
# Get user by email
# -------------------------------
@router.get("/by-email")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": str(user.id), "email": user.email, "name": user.name}


# -------------------------------
# Send Contact Request (handles unregistered users)
# -------------------------------
@router.post("/send-request")
def send_contact_request(request: ContactRequestCreate, db: Session = Depends(get_db)):
    sender_id = request.sender_id
    receiver_email = request.receiver_email

    # Find sender
    sender = db.query(User).filter(User.id == sender_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    # Find receiver by email
    receiver = db.query(User).filter(User.email == receiver_email).first()

    # If receiver doesn't exist, create an invitation instead
    if not receiver:
        # Create an invite for unregistered user
        new_invite = Invite(
            id=str(uuid4()),
            sender_id=sender.id,
            email=receiver_email,
            message=request.message if hasattr(request, 'message') else "Join me on Seer Sync!"
        )
        db.add(new_invite)
        db.commit()
        
        # Send invitation email
        try:
            email_service.send_invite_email(
                recipient_email=receiver_email,
                sender_name=sender.name,
                message=new_invite.message
            )
        except Exception as e:
            print(f"Error sending invite email: {e}")
        
        return {
            "success": True,
            "type": "invite_sent",
            "message": f"Invitation sent to {receiver_email}. They can accept it after signing up.",
            "invite_id": new_invite.id
        }

    # Receiver exists - create contact request
    if str(sender.id) == str(receiver.id):
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    # Check for existing pending request
    existing_request = db.query(ContactRequest).filter(
        ContactRequest.sender_id == sender.id,
        ContactRequest.receiver_id == receiver.id,
        ContactRequest.status == "pending"
    ).first()

    if existing_request:
        raise HTTPException(status_code=400, detail="Request already sent")

    # Create contact request
    new_request = ContactRequest(
        id=str(uuid4()),
        sender_id=sender.id,
        receiver_id=receiver.id
    )

    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {
        "success": True,
        "type": "request_sent",
        "request_id": new_request.id,
        "sender_id": str(sender.id),
        "receiver_id": str(receiver.id)
    }


# -------------------------------
# List incoming contact requests
# -------------------------------
@router.get("/incoming-requests")
def list_incoming_requests(user_id: str, db: Session = Depends(get_db)):
    """Get all pending contact requests for a user."""
    requests = db.query(ContactRequest).filter(
        ContactRequest.receiver_id == user_id,
        ContactRequest.status == "pending"
    ).all()

    return [
        {
            "request_id": r.id,
            "sender_id": str(r.sender_id),
            "sender_name": r.sender.name,
            "sender_email": r.sender.email,
        }
        for r in requests
    ]


# -------------------------------
# Accept contact request
# -------------------------------
@router.post("/accept-request")
def accept_contact_request(request_id: str, db: Session = Depends(get_db)):
    contact_request = db.query(ContactRequest).filter(ContactRequest.id == request_id).first()
    if not contact_request:
        raise HTTPException(status_code=404, detail="Request not found")

    contact_request.status = "accepted"

    # Create bidirectional contacts
    new_contact_1 = Contact(
        id=str(uuid4()),
        user_id=contact_request.sender_id,
        contact_user_id=contact_request.receiver_id,
        status="accepted"
    )
    new_contact_2 = Contact(
        id=str(uuid4()),
        user_id=contact_request.receiver_id,
        contact_user_id=contact_request.sender_id,
        status="accepted"
    )
    db.add(new_contact_1)
    db.add(new_contact_2)
    db.commit()
    db.refresh(new_contact_1)

    return {"success": True, "contact_id": new_contact_1.id}


# -------------------------------
# Reject contact request
# -------------------------------
@router.post("/reject-request")
def reject_contact_request(request_id: str, db: Session = Depends(get_db)):
    contact_request = db.query(ContactRequest).filter(ContactRequest.id == request_id).first()
    if not contact_request:
        raise HTTPException(status_code=404, detail="Request not found")

    contact_request.status = "rejected"
    db.commit()
    return {"success": True}


# -------------------------------
# Invite a contact via email
# -------------------------------
@router.post("/invite")
def invite_contact(invite_data: InviteCreate, user_id: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(User).filter(User.email == invite_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")

    if invite_data.email == user.email:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")

    # Create Invite record
    invite = Invite(
        id=str(uuid4()),
        sender_id=user.id,
        email=invite_data.email,
        message=invite_data.message
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    # Send invite email
    try:
        email_service.send_invite_email(
            recipient_email=invite_data.email,
            sender_name=user.name,
            message=invite_data.message
        )
    except Exception as e:
        print(f"Error sending invite email: {e}")

    return {
        "success": True,
        "message": f"Invitation sent to {invite_data.email}",
        "email": invite_data.email
    }


# -------------------------------
# Accept an invite
# -------------------------------
@router.post("/invite/accept")
def accept_invite(invite_id: str = Query(...), db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.accepted:
        raise HTTPException(status_code=400, detail="Invite already accepted")

    invite.accepted = True
    db.commit()
    return {"success": True, "message": "Invite accepted successfully"}


# -------------------------------
# Add a contact (for registered users)
# -------------------------------
# Add a contact (for registered users)
@router.post("/add")
def add_contact(
    user_id: str = Query(...),
    contact_user_id: str = Query(...),
    db: Session = Depends(get_db)
):
    print(f"Adding contact - user_id: {user_id}, contact_user_id: {contact_user_id}")
    
    # Get the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the contact by ID
    contact_user = db.query(User).filter(User.id == contact_user_id).first()
    if not contact_user:
        raise HTTPException(status_code=404, detail="Contact user not found")

    # Prevent adding yourself
    if str(user.id) == str(contact_user.id):
        raise HTTPException(status_code=400, detail="Cannot add yourself as contact")

    # Check if contact already exists (both directions)
    existing_contact = db.query(Contact).filter(
        Contact.user_id == user.id,
        Contact.contact_user_id == contact_user.id
    ).first()
    if existing_contact:
        raise HTTPException(status_code=400, detail="Contact already exists")

    # Create bidirectional contacts
    new_contact_1 = Contact(
        id=str(uuid4()),
        user_id=user.id,
        contact_user_id=contact_user.id,
        status="accepted"
    )
    new_contact_2 = Contact(
        id=str(uuid4()),
        user_id=contact_user.id,
        contact_user_id=user.id,
        status="accepted"
    )
    db.add(new_contact_1)
    db.add(new_contact_2)
    db.commit()
    db.refresh(new_contact_1)

    return {
        "success": True,
        "contact_id": new_contact_1.id,
        "contact_email": contact_user.email,
        "contact_name": contact_user.name
    }

# -------------------------------
# List all contacts
# -------------------------------
@router.get("/list")
def list_contacts(user_id: str = Query(...), db: Session = Depends(get_db)):
    """List all contacts for a given user."""
    # Try to find by google_id first (from frontend), then by id
    user = db.query(User).filter(User.google_id == user_id).first()
    if not user:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    contacts = db.query(Contact).filter(Contact.user_id == user_id).all()

    response = []
    for c in contacts:
        contact_user = db.query(User).filter(User.id == c.contact_user_id).first()
        if contact_user:
            response.append({
                "id": c.id,
                "contact_user_id": c.contact_user_id,
                "contact_name": contact_user.name,
                "contact_email": contact_user.email,
                "contact_picture": contact_user.picture,
                "status": c.status,
                "created_at": c.created_at
            })

    return response


# -------------------------------
# Delete a contact
# -------------------------------
@router.delete("/{contact_id}")
def delete_contact(contact_id: str, user_id: str = Query(...), db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.user_id == user_id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Delete both directions
    db.query(Contact).filter(
        Contact.user_id == contact.contact_user_id,
        Contact.contact_user_id == contact.user_id
    ).delete()
    
    db.delete(contact)
    db.commit()
    return {"success": True, "message": "Contact deleted successfully"}