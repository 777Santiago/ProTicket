from sqlalchemy.orm import Session
from models.models import Event 
from schemas.event import EventCreate, EventUpdate


def create_event(db: Session, event: EventCreate):
    """Crear un evento y guardar el creator_user_id"""
    # Convertir el schema a diccionario para crear el evento
    event_data = event.model_dump()
    
    # Crear el evento con todos los datos incluyendo creator_user_id
    db_event = Event(**event_data)
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    print(f"✅ Evento creado con creator_user_id: {db_event.creator_user_id}")
    
    return db_event


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