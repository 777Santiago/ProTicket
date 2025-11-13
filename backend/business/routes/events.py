from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
import jwt
from uuid import UUID as UUIDType, UUID
from core.database import get_db
from schemas.event import EventCreate, EventOut, EventUpdate
from crud import crud_event

router = APIRouter(prefix="/events", tags=["Events"])

# CLAVE SECRETA DEL JWT - Debe coincidir con la del servicio de autenticación
JWT_SECRET = "e7b40ad12b39acb16f4d6b8216c815b9c3e5db02d45f7c1f7b67ac43f2f3c6fd"

def get_user_id_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extrae el user_id del token JWT (soporta tokens de Supabase y JWT personalizados)"""
    if not authorization or not authorization.startswith("Bearer "):
        print("❌ No hay token de autorización")
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Primero intentar decodificar como token de Supabase (sin verificación para leer el payload)
        # Los tokens de Supabase tienen el user_id en el campo 'sub'
        try:
            # Decodificar sin verificar para leer el payload (los tokens de Supabase usan RS256)
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub")  # Supabase usa 'sub' para el user_id
            if user_id:
                print(f"✅ Token de Supabase decodificado - user_id (sub): {user_id}")
                return user_id
        except Exception as e:
            print(f"⚠️ No es un token de Supabase estándar: {e}")
        
        # Si no es un token de Supabase, intentar con JWT personalizado
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if user_id:
                print(f"✅ Token JWT personalizado decodificado - user_id: {user_id}")
                return user_id
        except jwt.InvalidTokenError as e:
            print(f"❌ Token JWT personalizado inválido: {e}")
        
        print("❌ No se pudo extraer user_id del token")
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
    
    print(f"✅ Usuario autenticado: {user_id} (tipo: {type(user_id)})")
    
    # Asignar el creator_user_id (convertir string a UUID si es necesario)
    try:
        # Si user_id es string, convertirlo a UUID
        if isinstance(user_id, str):
            event.creator_user_id = UUID(user_id)
        else:
            event.creator_user_id = user_id
        print(f"✅ Evento a crear con creator_user_id: {event.creator_user_id} (tipo: {type(event.creator_user_id)})")
    except (ValueError, TypeError) as e:
        print(f"❌ Error convirtiendo user_id a UUID: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"ID de usuario inválido: {user_id}"
        )
    
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

@router.get("/creator/{creator_user_id}", response_model=list[EventOut])
def get_events_by_creator(
    creator_user_id: UUID,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Obtener todos los eventos creados por un usuario específico"""
    try:
        print(f"\n=== OBTENER EVENTOS POR CREADOR {creator_user_id} ===")
        print(f"Tipo de creator_user_id: {type(creator_user_id)}")
        
        # Verificar autenticación
        user_id = get_user_id_from_token(authorization)
        if not user_id:
            print("❌ No se pudo extraer user_id del token")
            raise HTTPException(
                status_code=401,
                detail="Debes iniciar sesión para ver tus eventos"
            )
        
        print(f"✅ User ID del token: {user_id} (tipo: {type(user_id)})")
        print(f"✅ Creator User ID del path: {creator_user_id} (tipo: {type(creator_user_id)})")
        
        # Verificar que el usuario solo pueda ver sus propios eventos
        # Convertir ambos a string para comparar
        user_id_str = str(user_id)
        creator_id_str = str(creator_user_id)
        
        print(f"🔍 Comparando: '{user_id_str}' == '{creator_id_str}'")
        
        if user_id_str != creator_id_str:
            print("❌ Los IDs no coinciden")
            raise HTTPException(
                status_code=403,
                detail="No tienes permiso para ver los eventos de otro usuario"
            )
        
        print("✅ Usuario autorizado, obteniendo eventos...")
        events = crud_event.get_events_by_creator(db, creator_user_id)
        print(f"✅ Eventos encontrados: {len(events)}")
        return events
        
    except HTTPException:
        # Re-lanzar HTTPException para que FastAPI la maneje correctamente con CORS
        raise
    except Exception as e:
        print(f"❌ Error inesperado en get_events_by_creator: {e}")
        print(f"❌ Tipo de error: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

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