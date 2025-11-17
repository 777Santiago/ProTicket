from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from models.models import Event, Order
from schemas.event import EventCreate, EventUpdate
from uuid import UUID


def create_event(db: Session, event: EventCreate):
    """Crear un evento y guardar el creator_user_id"""
    try:
        # Convertir el schema a diccionario para crear el evento
        event_data = event.model_dump()
        
        # Si no hay organizer_id, usar NULL
        if 'organizer_id' not in event_data or event_data['organizer_id'] is None:
            event_data['organizer_id'] = None
        
        # Asegurarse de que creator_user_id sea UUID
        if 'creator_user_id' in event_data and event_data['creator_user_id']:
            creator_id = event_data['creator_user_id']
            print(f"🔍 Creator user ID recibido: {creator_id} (tipo: {type(creator_id)})")
            if isinstance(creator_id, str):
                try:
                    event_data['creator_user_id'] = UUID(creator_id)
                    print(f"✅ Convertido a UUID: {event_data['creator_user_id']}")
                except (ValueError, TypeError):
                    print(f"⚠️ Manteniendo como string: {creator_id}")
                    event_data['creator_user_id'] = creator_id
        
        # Crear el evento
        db_event = Event(**event_data)
        
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        
        print(f"✅ Evento creado - ID: {db_event.id_event}, creator_user_id: {db_event.creator_user_id}, organizer_id: {db_event.organizer_id}")
        
        return db_event
    except Exception as e:
        print(f"❌ Error creando evento: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise


def get_all_events(db: Session):
    """Obtener todos los eventos CON estadísticas de ventas"""
    events = db.query(Event).all()
    
    # Enriquecer cada evento con estadísticas de órdenes
    enriched_events = []
    for event in events:
        # Calcular tickets vendidos desde las órdenes
        orders = db.query(Order).filter(Order.event_id == event.id_event).all()
        tickets_sold = sum([order.quantity for order in orders])
        
        # Calcular ingresos desde órdenes pagadas/confirmadas
        revenue = sum([
            float(order.total_price) 
            for order in orders 
            if order.status in ["paid", "confirmed"]
        ])
        
        # Crear un objeto enriquecido (no modificamos el objeto de SQLAlchemy directamente)
        event_dict = {
            "id_event": event.id_event,
            "organizer_id": event.organizer_id,
            "creator_user_id": event.creator_user_id,
            "title": event.title,
            "description": event.description,
            "location": event.location,
            "start_datetime": event.start_datetime,
            "price": event.price,
            "capacity": event.capacity,
            "status": event.status,
            "created_at": event.created_at,
            "tickets_sold": tickets_sold,  # NUEVO
            "available_tickets": max(0, (event.capacity or 0) - tickets_sold),  # NUEVO
            "revenue": revenue,  # NUEVO
        }
        enriched_events.append(event_dict)
    
    print(f"✅ Eventos obtenidos con estadísticas: {len(enriched_events)}")
    for ev in enriched_events:
        print(f"   - Evento {ev['id_event']}: vendidos={ev['tickets_sold']}, disponibles={ev['available_tickets']}, ingresos=${ev['revenue']}")
    
    return enriched_events


def get_event_by_id(db: Session, id_event: int):
    """Obtener un evento por ID CON estadísticas"""
    event = db.query(Event).filter(Event.id_event == id_event).first()
    if not event:
        return None
    
    # Calcular estadísticas
    orders = db.query(Order).filter(Order.event_id == event.id_event).all()
    tickets_sold = sum([order.quantity for order in orders])
    revenue = sum([
        float(order.total_price) 
        for order in orders 
        if order.status in ["paid", "confirmed"]
    ])
    
    # Crear objeto enriquecido
    event_dict = {
        "id_event": event.id_event,
        "organizer_id": event.organizer_id,
        "creator_user_id": event.creator_user_id,
        "title": event.title,
        "description": event.description,
        "location": event.location,
        "start_datetime": event.start_datetime,
        "price": event.price,
        "capacity": event.capacity,
        "status": event.status,
        "created_at": event.created_at,
        "tickets_sold": tickets_sold,
        "available_tickets": max(0, (event.capacity or 0) - tickets_sold),
        "revenue": revenue,
    }
    
    print(f"Evento encontrado con estadísticas: id={event.id_event}, vendidos={tickets_sold}, disponibles={event_dict['available_tickets']}")
    return event_dict


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
    
    # Retornar con estadísticas
    return get_event_by_id(db, id_event)


def delete_event(db: Session, id_event: int):
    event = db.query(Event).filter(Event.id_event == id_event).first()
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True


def get_events_by_creator(db: Session, creator_user_id: UUID):
    """Obtener todos los eventos creados por un usuario específico CON estadísticas"""
    try:
        print(f"🔍 Buscando eventos con creator_user_id: {creator_user_id} (tipo: {type(creator_user_id)})")
        
        # Convertir UUID a string para la comparación (la columna en BD es VARCHAR)
        creator_id_str = str(creator_user_id)
        print(f"🔍 Comparando con string: {creator_id_str}")
        
        # Usar directamente cast a string ya que la columna en BD es VARCHAR
        events = db.query(Event).filter(
            cast(Event.creator_user_id, String) == creator_id_str
        ).all()
        
        # Enriquecer cada evento con estadísticas
        enriched_events = []
        for event in events:
            orders = db.query(Order).filter(Order.event_id == event.id_event).all()
            tickets_sold = sum([order.quantity for order in orders])
            revenue = sum([
                float(order.total_price) 
                for order in orders 
                if order.status in ["paid", "confirmed"]
            ])
            
            event_dict = {
                "id_event": event.id_event,
                "organizer_id": event.organizer_id,
                "creator_user_id": event.creator_user_id,
                "title": event.title,
                "description": event.description,
                "location": event.location,
                "start_datetime": event.start_datetime,
                "price": event.price,
                "capacity": event.capacity,
                "status": event.status,
                "created_at": event.created_at,
                "tickets_sold": tickets_sold,
                "available_tickets": max(0, (event.capacity or 0) - tickets_sold),
                "revenue": revenue,
            }
            enriched_events.append(event_dict)
        
        print(f"✅ Eventos encontrados para creator_user_id {creator_user_id}: {len(enriched_events)}")
        for ev in enriched_events:
            print(f"   - Evento {ev['id_event']}: vendidos={ev['tickets_sold']}, disponibles={ev['available_tickets']}, ingresos=${ev['revenue']}")
        
        return enriched_events
    except Exception as e:
        print(f"❌ Error en get_events_by_creator: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise