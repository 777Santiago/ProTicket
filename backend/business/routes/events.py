from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.event import EventCreate, EventOut, EventUpdate
from crud import crud_event
from services.auth_service import get_user_info

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=EventOut)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    # Descomentar cuando tengamos autenticación
    # user_info = get_user_info(str(event.organizer_id))
    # if not user_info or user_info["role"] != "organizer":
    #     raise HTTPException(
    #         status_code=403, 
    #         detail="User not authorized to create events")
    
    return crud_event.create_event(db, event)

#@router.post("/", response_model=EventOut)
#def create_event(event: EventCreate, db: Session = Depends(get_db)):
#    user_info = get_user_info(str(event.organizer_id))
#    if not user_info or user_info["role"] != "organizer":
#        raise HTTPException(
#            status_code=403, 
#            detail="User not authorized to create events")
#    
#    return crud_event.create_event(db, event)


@router.get("/", response_model=list[EventOut])
def get_events(db: Session = Depends(get_db)):
    return crud_event.get_all_events(db)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud_event.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(
            status_code=404, 
            detail="Event not found")
    
    return event


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    deleted = crud_event.delete_event(db, event_id)
    if not deleted:
        raise HTTPException(
            status_code=404, 
            detail="Event not found")
    
    return {"message": "Event deleted successfully",
            "deleted_event_id": event_id}

@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, event: EventUpdate, db: Session = Depends(get_db)):
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    # Actualizar solo los campos que se enviaron
    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event


@router.put("/{event_id}", response_model=EventOut)
def update_event_full(event_id: int, event_data: EventCreate, db: Session = Depends(get_db)):
    db_event = crud_event.get_event_by_id(db, event_id)
    if not db_event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )
    
    # Actualizar todos los campos
    for key, value in event_data.model_dump().items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event