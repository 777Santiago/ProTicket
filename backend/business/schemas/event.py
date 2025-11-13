from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from uuid import UUID

class EventBase(BaseModel):
    title: str
    description: str
    location: str
    start_datetime: datetime
    price: float
    capacity: int
    status: Optional[str] = "active"

class EventCreate(EventBase):
    organizer_id: int
    creator_user_id: Optional[UUID] = None  # NUEVO: ID del usuario creador (UUID)

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    price: Optional[float] = None
    capacity: Optional[int] = None
    status: Optional[str] = None

class EventOut(EventBase):
    id_event: int       
    organizer_id: int
    creator_user_id: Optional[UUID] = None  # NUEVO: ID del usuario creador (UUID)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)