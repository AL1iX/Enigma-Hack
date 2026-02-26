from datetime import datetime
from pydantic import BaseModel

from .models import TicketStatus


class TicketCreate(BaseModel):
    subject: str
    client_email: str
    initial_message: str | None = None


class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    draft_response: str | None = None


class TicketResponse(BaseModel):
    id: int
    subject: str
    client_email: str
    status: TicketStatus
    draft_response: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    ticket_id: int
    content: str
    sender_type: str
    created_at: datetime

    class Config:
        from_attributes = True
