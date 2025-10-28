from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.message import Message
from uuid import uuid4

router = APIRouter()

@router.post("/send")
def send_message(
    sender_id: str = Query(...),
    receiver_id: str = Query(...),
    content: str = Query(...),
    db: Session = Depends(get_db)
):
    msg = Message(id=str(uuid4()), sender_id=sender_id, receiver_id=receiver_id, content=content)
    db.add(msg)
    db.commit()
    return {"success": True, "message_id": msg.id}

@router.get("/history")
def get_messages(
    user_id: str = Query(...),
    contact_id: str = Query(...),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        ((Message.sender_id == user_id) & (Message.receiver_id == contact_id)) |
        ((Message.sender_id == contact_id) & (Message.receiver_id == user_id))
    ).order_by(Message.created_at).all()
    return [{"id": m.id, "sender_id": m.sender_id, "content": m.content, "created_at": m.created_at} for m in messages]

@router.delete("/delete")
def delete_message(message_id: str = Query(...), user_id: str = Query(...), db: Session = Depends(get_db)):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if msg.sender_id != user_id:
        raise HTTPException(status_code=403, detail="Cannot delete message from another user")
    
    db.delete(msg)
    db.commit()
    return {"success": True}