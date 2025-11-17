from sqlalchemy.orm import Session
from sqlalchemy import cast, String
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
            buyer_name=order_data.buyer_name,
            event_id=order_data.event_id,
            quantity=order_data.quantity,
            total_price=total_price,
            status="confirmed",  # CAMBIO: De "pending" a "confirmed"
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


def get_orders_by_organizer(db: Session, creator_user_id: UUID):
    """Obtener todas las órdenes de eventos creados por un organizador específico"""
    try:
        creator_id_str = str(creator_user_id)
        print(f"🔍 Buscando órdenes para organizador: {creator_user_id}")
        
        # Obtener todos los eventos creados por este organizador
        # Usar directamente cast a string ya que la columna en BD es VARCHAR
        events = db.query(Event).filter(
            cast(Event.creator_user_id, String) == creator_id_str
        ).all()
        
        event_ids = [event.id_event for event in events]
        print(f"✅ Eventos encontrados: {len(events)}, IDs: {event_ids}")
        
        if not event_ids:
            print("⚠️ No hay eventos para este organizador")
            return []
        
        # Obtener todas las órdenes de esos eventos
        orders = db.query(Order).filter(Order.event_id.in_(event_ids)).all()
        print(f"✅ Órdenes encontradas para organizador {creator_user_id}: {len(orders)}")
        return orders
    except Exception as e:
        print(f"❌ Error en get_orders_by_organizer: {e}")
        import traceback
        traceback.print_exc()
        # Hacer rollback en caso de error
        db.rollback()
        raise
