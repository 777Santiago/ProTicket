from sqlalchemy.orm import Session

from sqlalchemy.exc import SQLAlchemyError
from models.models import Order, Event
from schemas.order import OrderCreate
from uuid import UUID

def create_order(db: Session, order_data: OrderCreate, buyer_id: UUID):
    event = db.query(Event).filter(Event.id_event == order_data.event_id).first()
    if not event:
        return None, "Event not found"

    # Calculate sold tickets
    total_orders = db.query(Order).filter(Order.event_id == order_data.event_id).all()
    tickets_vendidos = sum([o.quantity for o in total_orders])
    if event.capacity and tickets_vendidos + order_data.quantity > event.capacity:        
        return None, "Not enough available seats for this event"

    try:
        total_price = event.price * order_data.quantity
        new_order = Order(
            buyer_id=buyer_id,
            event_id=order_data.event_id,
            quantity=order_data.quantity,
            total_price=total_price,
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order, None
    except SQLAlchemyError as e:
        db.rollback()
        return None, f"Error creating order: {str(e)}"


def get_order_by_id(db: Session, order_id: int):
    return db.query(Order).filter(Order.id_order == order_id).first()


def get_orders_by_user(db: Session, buyer_id: UUID):
    orders = db.query(Order).filter(Order.buyer_id == buyer_id).all()
    return orders


def update_order_status(db: Session, order_id: int, new_status: str):
    order = db.query(Order).filter(Order.id_order == order_id).first()
    if not order:
        return None, "Order not found"

    valid_status = ["pending", "paid", "cancelled", "refunded"]
    if new_status not in valid_status:        
        return None, f"Invalid status. Must be one of: {', '.join(valid_status)}"

    try:
        order.status = new_status
        db.commit()
        db.refresh(order)
        return order, None
    except SQLAlchemyError as e:
        db.rollback()    
        return None, f"Error updating order status: {str(e)}"
