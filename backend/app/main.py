from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_db, init_db
from .models import Ticket, Message, TicketStatus, SenderType
from .schemas import TicketCreate, TicketUpdate, TicketResponse, MessageResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Support Agent API", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/tickets", response_model=list[TicketResponse])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    tickets = result.scalars().all()
    return tickets


@app.post("/tickets", response_model=TicketResponse)
async def create_ticket(body: TicketCreate, db: AsyncSession = Depends(get_db)):
    ticket = Ticket(
        subject=body.subject,
        client_email=body.client_email,
        status=TicketStatus.new,
    )
    db.add(ticket)
    await db.flush()
    if body.initial_message:
        msg = Message(
            ticket_id=ticket.id,
            content=body.initial_message,
            sender_type=SenderType.client,
        )
        db.add(msg)
    return ticket


@app.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@app.patch("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: int, body: TicketUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if body.status is not None:
        ticket.status = body.status
    if body.draft_response is not None:
        ticket.draft_response = body.draft_response
    return ticket


@app.get("/tickets/{ticket_id}/messages", response_model=list[MessageResponse])
async def list_messages(ticket_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message).where(Message.ticket_id == ticket_id).order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return [
        MessageResponse(
            id=m.id,
            ticket_id=m.ticket_id,
            content=m.content,
            sender_type=m.sender_type.value,
            created_at=m.created_at,
        )
        for m in messages
    ]
