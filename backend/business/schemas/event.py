from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class EventBase(BaseModel):
    title: str
    description: str
    location: str
    start_datetime: datetime
    price: float
    capacity: int

class EventCreate(EventBase):
    organizer_id: int   

class EventOut(EventBase):
    id_event: int       
    organizer_id: int   
    

    model_config = ConfigDict(from_attributes=True)