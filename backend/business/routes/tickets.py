from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from core.database import get_db
from schemas.ticket import TicketCreate, TicketOut
from crud import crud_tickets

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.post("/", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_data: TicketCreate, db: Session = Depends(get_db)):
    new_ticket, error = crud_tickets.create_ticket(db, ticket_data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return new_ticket

@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    ticket = crud_tickets.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.get("/order/{order_id}", response_model=list[TicketOut])
def get_tickets_by_order(order_id: int, db: Session = Depends(get_db)):
    tickets = crud_tickets.get_tickets_by_order(db, order_id)
    if not tickets:
        raise HTTPException(status_code=404, detail="No tickets found for this order")
    return tickets

@router.get("/code/{ticket_code}", response_model=TicketOut)
def get_ticket_by_code(ticket_code: UUID, db: Session = Depends(get_db)):
    ticket = crud_tickets.get_ticket_by_code(db, ticket_code)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
