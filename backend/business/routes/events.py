from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
import jwt
from core.database import get_db
from schemas.event import EventCreate, EventOut, EventUpdate
from crud import crud_event

router = APIRouter(prefix="/events", tags=["Events"])

# CLAVE SECRETA DEL JWT - Debe coincidir con la del servicio de autenticación
JWT_SECRET = "e7b40ad12b39acb16f4d6b8216c815b9c3e5db02d45f7c1f7b67ac43f2f3c6fd"

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extrae el user_id del token JWT"""
    if not authorization or not authorization.startswith("Bearer "):
        print("❌ No hay token de autorización")
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        # Decodificar el JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        print(f"✅ Token decodificado - user_id: {user_id}")
        return user_id
    except jwt.InvalidTokenError as e:
        print(f"❌ Token inválido: {e}")
        return None
    except Exception as e:
        print(f"❌ Error decodificando token: {e}")
        return None

@router.post("/", response_model=EventOut)
def create_event(
    event: EventCreate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Crear un nuevo evento"""
    print("\n=== CREAR EVENTO ===")
    
    # Extraer user_id del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para crear eventos"
        )
    
    print(f"✅ Usuario autenticado: {user_id}")
    
    # Asignar el creator_user_id
    event.creator_user_id = user_id
    
    print(f"✅ Evento a crear con creator_user_id: {event.creator_user_id}")
    
    # Crear el evento
    created_event = crud_event.create_event(db, event)
    
    print(f"✅ Evento creado en BD - ID: {created_event.id_event}, creator_user_id: {created_event.creator_user_id}")
    
    return created_event

@router.get("/", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    """Obtener todos los eventos"""
    events = crud_event.get_all_events(db)
    print(f"\n=== OBTENER EVENTOS === Total: {len(events)}")
    for event in events:
        print(f"  - Evento {event.id_event}: creator={event.creator_user_id}")
    return events

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Obtener un evento por ID"""
    event = crud_event.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    print(f"\n=== GET EVENTO {event_id} === creator_user_id: {event.creator_user_id}")
    return event

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int, 
    event: EventUpdate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Actualizar un evento existente - Solo el creador puede editarlo"""
    print(f"\n=== ACTUALIZAR EVENTO {event_id} ===")
    
    # Obtener el evento
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        print(f"❌ Evento {event_id} no encontrado")
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    print(f"📌 Evento en BD - creator_user_id: {db_event.creator_user_id}")
    
    # Extraer user_id del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para editar eventos"
        )
    
    print(f"👤 Usuario actual: {user_id}")
    
    # Validar que el usuario sea el creador del evento
    # Convertir ambos a string para comparar
    event_creator = str(db_event.creator_user_id) if db_event.creator_user_id else None
    current_user = str(user_id)
    
    print(f"🔍 Comparando creadores:")
    print(f"   - Creador del evento: {event_creator}")
    print(f"   - Usuario actual: {current_user}")
    print(f"   - ¿Son iguales?: {event_creator == current_user}")
    
    if event_creator and event_creator != current_user:
        print("❌ El usuario NO es el creador del evento")
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para editar este evento. Solo el creador puede modificarlo."
        )
    
    print("✅ Usuario autorizado para editar")
    
    # Actualizar usando el CRUD
    updated_event = crud_event.update_event(db, event_id, event)
    
    if not updated_event:
        raise HTTPException(status_code=404, detail="Error al actualizar evento")
    
    print(f"✅ Evento actualizado - creator_user_id preservado: {updated_event.creator_user_id}")
    
    return updated_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Eliminar un evento - Solo el creador puede eliminarlo"""
    print(f"\n=== ELIMINAR EVENTO {event_id} ===")
    
    # Obtener el evento
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        print(f"❌ Evento {event_id} no encontrado")
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    print(f"📌 Evento en BD - creator_user_id: {db_event.creator_user_id}")
    
    # Extraer user_id del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para eliminar eventos"
        )
    
    print(f"👤 Usuario actual: {user_id}")
    
    # Validar que el usuario sea el creador del evento
    event_creator = str(db_event.creator_user_id) if db_event.creator_user_id else None
    current_user = str(user_id)
    
    print(f"🔍 Comparando creadores:")
    print(f"   - Creador del evento: {event_creator}")
    print(f"   - Usuario actual: {current_user}")
    print(f"   - ¿Son iguales?: {event_creator == current_user}")
    
    if event_creator and event_creator != current_user:
        print("❌ El usuario NO es el creador del evento")
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para eliminar este evento. Solo el creador puede eliminarlo."
        )
    
    print("✅ Usuario autorizado para eliminar")
    
    deleted = crud_event.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    print(f"✅ Evento {event_id} eliminado exitosamente")
    
    return {"message": "Evento eliminado exitosamente", "deleted_event_id": event_id}