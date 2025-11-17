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
    organizer_id: Optional[int] = None  # CAMBIO: Ahora es opcional
    creator_user_id: Optional[UUID] = None

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
    organizer_id: Optional[int] = None  # CAMBIO: Ahora es opcional
    creator_user_id: Optional[UUID] = None
    created_at: datetime
    # Estadísticas calculadas
    tickets_sold: Optional[int] = 0
    available_tickets: Optional[int] = None
    revenue: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)