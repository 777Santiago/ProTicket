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

def get_user_role_from_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extrae el rol del usuario del token JWT"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.replace("Bearer ", "")
        
        # Intentar decodificar como token de Supabase
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            # En Supabase el rol puede estar en user_metadata
            user_metadata = payload.get("user_metadata", {})
            role = user_metadata.get("role")
            if role:
                print(f"✅ Rol extraído de Supabase token: {role}")
                return role
        except Exception:
            pass
        
        # Intentar con JWT personalizado
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            role = payload.get("role")
            if role:
                print(f"✅ Rol extraído de JWT personalizado: {role}")
                return role
        except jwt.InvalidTokenError:
            pass
        
        return None
        
    except Exception as e:
        print(f"❌ Error extrayendo rol del token: {e}")
        return None

@router.post("/", response_model=EventOut)
def create_event(
    event: EventCreate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Crear un nuevo evento - Organizers y ADMIN pueden crear"""
    print("\n=== CREAR EVENTO ===")
    
    # Extraer user_id y role del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para crear eventos"
        )
    
    print(f"✅ Usuario autenticado: {user_id} (tipo: {type(user_id)})")
    
    # NUEVO: Obtener el rol del usuario
    user_role = get_user_role_from_token(authorization)
    print(f"👔 Rol del usuario: {user_role}")
    
    # Validar que sea organizer o admin
    if user_role not in ["organizer", "admin"]:
        print(f"❌ Usuario con rol '{user_role}' no puede crear eventos")
        raise HTTPException(
            status_code=403,
            detail="Solo los organizadores y administradores pueden crear eventos"
        )
    
    print(f"✅ Usuario autorizado para crear eventos (rol: {user_role})")
    
    # Asignar el creator_user_id
    try:
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

@router.get("/")
def get_events(db: Session = Depends(get_db)):
    """Obtener todos los eventos CON estadísticas"""
    events = crud_event.get_all_events(db)
    print(f"\n=== OBTENER EVENTOS === Total: {len(events)}")
    # Los eventos ya vienen como diccionarios con estadísticas
    return events

@router.get("/creator/{creator_user_id}")
def get_events_by_creator(
    creator_user_id: UUID,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Obtener todos los eventos creados por un usuario específico CON estadísticas"""
    try:
        print(f"\n=== OBTENER EVENTOS POR CREADOR {creator_user_id} ===")
        
        user_id = get_user_id_from_token(authorization)
        if not user_id:
            raise HTTPException(status_code=401, detail="Debes iniciar sesión")
        
        if str(user_id) != str(creator_user_id):
            raise HTTPException(status_code=403, detail="No autorizado")
        
        events = crud_event.get_events_by_creator(db, creator_user_id)
        print(f"✅ Eventos encontrados: {len(events)}")
        return events
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}")
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Obtener un evento por ID CON estadísticas"""
    event = crud_event.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return event

@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int, 
    event: EventUpdate, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Actualizar un evento existente - Creador o ADMIN pueden editarlo"""
    print(f"\n=== ACTUALIZAR EVENTO {event_id} ===")
    
    # Obtener el evento
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        print(f"❌ Evento {event_id} no encontrado")
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    # Es un dict, no un objeto SQLAlchemy
    event_creator = str(db_event.get('creator_user_id')) if db_event.get('creator_user_id') else None
    print(f"📌 Evento en BD - creator_user_id: {event_creator}")
    
    # Extraer user_id y role del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para editar eventos"
        )
    
    print(f"👤 Usuario actual: {user_id}")
    
    # NUEVO: Obtener el rol del usuario desde el token
    user_role = get_user_role_from_token(authorization)
    print(f"👔 Rol del usuario: {user_role}")
    
    # Validar permisos: admin puede editar cualquier evento, otros solo sus propios eventos
    current_user = str(user_id)
    
    if user_role == "admin":
        print("✅ Usuario ADMIN - Puede editar cualquier evento")
    elif event_creator and event_creator != current_user:
        print("❌ El usuario NO es el creador ni ADMIN")
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para editar este evento. Solo el creador o un administrador pueden modificarlo."
        )
    else:
        print("✅ Usuario autorizado para editar (es el creador)")
    
    # Actualizar usando el CRUD
    updated_event = crud_event.update_event(db, event_id, event)
    
    if not updated_event:
        raise HTTPException(status_code=404, detail="Error al actualizar evento")
    
    print(f"✅ Evento actualizado")
    
    return updated_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int, 
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Eliminar un evento - Creador o ADMIN pueden eliminarlo"""
    print(f"\n=== ELIMINAR EVENTO {event_id} ===")
    
    # Obtener el evento
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        print(f"❌ Evento {event_id} no encontrado")
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    event_creator = str(db_event.get('creator_user_id')) if db_event.get('creator_user_id') else None
    print(f"📌 Evento en BD - creator_user_id: {event_creator}")
    
    # Extraer user_id y role del token
    user_id = get_user_id_from_token(authorization)
    
    if not user_id:
        print("❌ No se pudo extraer user_id del token")
        raise HTTPException(
            status_code=401, 
            detail="Debes iniciar sesión para eliminar eventos"
        )
    
    print(f"👤 Usuario actual: {user_id}")
    
    # NUEVO: Obtener el rol del usuario desde el token
    user_role = get_user_role_from_token(authorization)
    print(f"👔 Rol del usuario: {user_role}")
    
    # Validar permisos: admin puede eliminar cualquier evento, otros solo sus propios eventos
    current_user = str(user_id)
    
    if user_role == "admin":
        print("✅ Usuario ADMIN - Puede eliminar cualquier evento")
    elif event_creator and event_creator != current_user:
        print("❌ El usuario NO es el creador ni ADMIN")
        raise HTTPException(
            status_code=403, 
            detail="No tienes permiso para eliminar este evento. Solo el creador o un administrador pueden eliminarlo."
        )
    else:
        print("✅ Usuario autorizado para eliminar (es el creador)")
    
    deleted = crud_event.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    
    print(f"✅ Evento {event_id} eliminado exitosamente")
    
    return {"message": "Evento eliminado exitosamente", "deleted_event_id": event_id}