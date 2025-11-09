from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.models import Ticket, Order
from schemas.ticket import TicketCreate
from uuid import uuid4

def create_ticket(db: Session, ticket_data: TicketCreate):    
    # Validate that the order exists
    order = db.query(Order).filter(Order.id_order == ticket_data.order_id).first()
    if not order:
        return None, "Order not found"

    try:        
        # Create ticket with code and QR
        new_ticket = Ticket(
            order_id=ticket_data.order_id,
            id_ticket=uuid4(),
            ticket_code=uuid4(),  # Generate a new UUID code
            pdf_url=ticket_data.pdf_url,
            qr_code=ticket_data.qr_code
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket, None
    except SQLAlchemyError as e:
        db.rollback()
        return None, f"Error creating ticket: {str(e)}"


def get_ticket_by_id(db: Session, ticket_id):
    return db.query(Ticket).filter(Ticket.id_ticket == ticket_id).first()


def get_tickets_by_order(db: Session, order_id: int):
    return db.query(Ticket).filter(Ticket.order_id == order_id).all()


def get_ticket_by_code(db: Session, ticket_code):
    return db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
