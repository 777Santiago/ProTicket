from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from core.database import get_db
from schemas.order import OrderCreate, OrderOut, OrderUpdate
from crud import crud_orders

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):    
    # Usar el buyer_id que viene en el schema OrderCreate
    new_order, error = crud_orders.create_order(db, order_data, order_data.buyer_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return new_order

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = crud_orders.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden not found")
    return order

@router.get("/user/{buyer_id}", response_model=list[OrderOut])
def get_orders_by_user(buyer_id: UUID, db: Session = Depends(get_db)):
    # CAMBIO: Siempre retornar lista, incluso si está vacía
    orders = crud_orders.get_orders_by_user(db, buyer_id)
    return orders  # Retorna [] si no hay órdenes, no lanza error 404

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, update_data: OrderUpdate, db: Session = Depends(get_db)):
    order, error = crud_orders.update_order_status(db, order_id, update_data.status)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return order

@router.get("/organizer/{creator_user_id}")
def get_orders_by_organizer(
    creator_user_id: UUID,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Obtener todas las órdenes de eventos creados por un organizador CON NOMBRES"""
    try:
        from routes.events import get_user_id_from_token
        from models.models import Event
        
        print(f"\n=== OBTENER ÓRDENES POR ORGANIZADOR {creator_user_id} ===")
        
        # Verificar autenticación
        user_id = get_user_id_from_token(authorization)
        if not user_id:
            raise HTTPException(status_code=401, detail="No autorizado")
        
        if str(user_id) != str(creator_user_id):
            raise HTTPException(status_code=403, detail="No autorizado")
        
        orders = crud_orders.get_orders_by_organizer(db, creator_user_id)
        
        # Enriquecer órdenes con información del evento y nombre del comprador
        enriched_orders = []
        for order in orders:
            event = db.query(Event).filter(Event.id_event == order.event_id).first()
            order_dict = {
                "id_order": order.id_order,
                "buyer_id": str(order.buyer_id),
                "buyer_name": order.buyer_name or "Usuario",  # USAR EL NOMBRE GUARDADO
                "event_id": order.event_id,
                "event_title": event.title if event else "Evento Desconocido",
                "quantity": order.quantity,
                "total_price": float(order.total_price),
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None,
            }
            enriched_orders.append(order_dict)
        
        print(f"✅ Órdenes enriquecidas encontradas: {len(enriched_orders)}")
        return enriched_orders
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))