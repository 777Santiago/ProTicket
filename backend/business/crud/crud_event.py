from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from models.models import Event 
from schemas.event import EventCreate, EventUpdate
from uuid import UUID


def create_event(db: Session, event: EventCreate):
    """Crear un evento y guardar el creator_user_id"""
    try:
        # Convertir el schema a diccionario para crear el evento
        event_data = event.model_dump()
        
        # Asegurarse de que creator_user_id sea UUID o string según lo que la BD acepte
        if 'creator_user_id' in event_data and event_data['creator_user_id']:
            creator_id = event_data['creator_user_id']
            print(f"🔍 Creator user ID recibido: {creator_id} (tipo: {type(creator_id)})")
            # Si es UUID, mantenerlo; si es string, intentar convertirlo
            if isinstance(creator_id, str):
                try:
                    event_data['creator_user_id'] = UUID(creator_id)
                    print(f"✅ Convertido a UUID: {event_data['creator_user_id']}")
                except (ValueError, TypeError):
                    # Si no se puede convertir, mantener como string (para BD VARCHAR)
                    print(f"⚠️ Manteniendo como string (BD puede ser VARCHAR): {creator_id}")
                    event_data['creator_user_id'] = creator_id
        
        # Crear el evento con todos los datos incluyendo creator_user_id
        db_event = Event(**event_data)
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        print(f"✅ Evento creado - ID: {db_event.id_event}, creator_user_id: {db_event.creator_user_id} (tipo: {type(db_event.creator_user_id)})")
        
        return db_event
    except Exception as e:
        print(f"❌ Error creando evento: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise


def get_all_events(db: Session):
    events = db.query(Event).all()
    # Imprimir para debug
    for event in events:
        print(f"Evento {event.id_event}: creator_user_id={event.creator_user_id}")
    return events


def get_event_by_id(db: Session, id_event: int):
    event = db.query(Event).filter(Event.id_event == id_event).first()
    if event:
        print(f"Evento encontrado: id={event.id_event}, creator_user_id={event.creator_user_id}")
    return event


def update_event(db: Session, id_event: int, event: EventUpdate):
    """Actualizar un evento sin modificar el creator_user_id"""
    db_event = db.query(Event).filter(Event.id_event == id_event).first()
    if not db_event:
        return None
    
    # Actualizar solo los campos que se enviaron
    update_data = event.model_dump(exclude_unset=True)
    
    # Asegurarnos de NO actualizar creator_user_id
    if 'creator_user_id' in update_data:
        del update_data['creator_user_id']
    
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    
    print(f"✅ Evento actualizado: id={db_event.id_event}, creator_user_id={db_event.creator_user_id}")
    
    return db_event


def delete_event(db: Session, id_event: int):
    event = db.query(Event).filter(Event.id_event == id_event).first()
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True


def get_events_by_creator(db: Session, creator_user_id: UUID):
    """Obtener todos los eventos creados por un usuario específico"""
    try:
        print(f"🔍 Buscando eventos con creator_user_id: {creator_user_id} (tipo: {type(creator_user_id)})")
        
        # Convertir UUID a string para la comparación (la columna en BD es VARCHAR)
        creator_id_str = str(creator_user_id)
        print(f"🔍 Comparando con string: {creator_id_str}")
        
        # Usar directamente cast a string ya que la columna en BD es VARCHAR
        # Esto evita el error de transacción abortada
        events = db.query(Event).filter(
            cast(Event.creator_user_id, String) == creator_id_str
        ).all()
        
        print(f"✅ Eventos encontrados para creator_user_id {creator_user_id}: {len(events)}")
        for event in events:
            print(f"   - Evento {event.id_event}: creator={event.creator_user_id} (tipo: {type(event.creator_user_id)})")
        return events
    except Exception as e:
        print(f"❌ Error en get_events_by_creator: {e}")
        import traceback
        traceback.print_exc()
        # Hacer rollback en caso de error
        db.rollback()
        raise