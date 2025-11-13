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

@router.get("/organizer/{creator_user_id}", response_model=list[OrderOut])
def get_orders_by_organizer(
    creator_user_id: UUID,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Obtener todas las órdenes de eventos creados por un organizador"""
    try:
        from routes.events import get_user_id_from_token
        
        print(f"\n=== OBTENER ÓRDENES POR ORGANIZADOR {creator_user_id} ===")
        
        # Verificar autenticación
        user_id = get_user_id_from_token(authorization)
        if not user_id:
            print("❌ No se pudo extraer user_id del token")
            raise HTTPException(
                status_code=401,
                detail="Debes iniciar sesión para ver tus órdenes"
            )
        
        # Verificar que el usuario solo pueda ver sus propias órdenes
        if str(user_id) != str(creator_user_id):
            print(f"❌ IDs no coinciden: {user_id} != {creator_user_id}")
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para ver las órdenes de otro usuario"
            )
        
        print(f"✅ Usuario autorizado, obteniendo órdenes...")
        orders = crud_orders.get_orders_by_organizer(db, creator_user_id)
        print(f"✅ Órdenes encontradas: {len(orders)}")
        return orders
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error inesperado en get_orders_by_organizer: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )