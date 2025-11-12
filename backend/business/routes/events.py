from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from core.database import get_db
from schemas.event import EventCreate, EventOut, EventUpdate
from crud import crud_event

router = APIRouter(prefix="/events", tags=["Events"])

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extrae el user_id del token JWT (simplificado)"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    # Por ahora, solo retornamos None si no hay token
    # En producción, aquí decodificarías el JWT
    token = authorization.replace("Bearer ", "")
    # TODO: Decodificar JWT y extraer user_id
    return None

@router.post("/", response_model=EventOut)
def create_event(
    event: EventCreate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Crear un nuevo evento"""
    # Extraer user_id del token si existe
    user_id = get_user_id_from_token(authorization)
    
    # Si hay token, asignar el creator_user_id
    if user_id:
        event.creator_user_id = user_id
    
    return crud_event.create_event(db, event)

@router.get("/", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    """Obtener todos los eventos"""
    return crud_event.get_all_events(db)

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Obtener un evento por ID"""
    event = crud_event.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int, 
    event: EventUpdate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Actualizar un evento existente - Solo el creador puede editarlo"""
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Validar que el usuario sea el creador del evento
    user_id = get_user_id_from_token(authorization)
    if db_event.creator_user_id and user_id and db_event.creator_user_id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para editar este evento. Solo el creador puede modificarlo."
        )
    
    # Actualizar solo los campos que se enviaron
    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Eliminar un evento - Solo el creador puede eliminarlo"""
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Validar que el usuario sea el creador del evento
    user_id = get_user_id_from_token(authorization)
    if db_event.creator_user_id and user_id and db_event.creator_user_id != user_id:
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para eliminar este evento. Solo el creador puede eliminarlo."
        )
    
    deleted = crud_event.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Evento eliminado exitosamente", "deleted_event_id": event_id}