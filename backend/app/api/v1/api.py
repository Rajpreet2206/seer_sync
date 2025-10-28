from fastapi import APIRouter
from app.api.v1.endpoints import auth, contacts
from app.api.v1.endpoints import messages

api_router = APIRouter()

api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])