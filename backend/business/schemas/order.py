from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import Optional

class OrderBase(BaseModel):
    event_id: int
    quantity: int

class OrderCreate(OrderBase):
    buyer_id: UUID
    buyer_name: str

class OrderUpdate(BaseModel):
    status: str

class OrderOut(BaseModel):
    id_order: int
    buyer_id: UUID
    buyer_name: Optional[str] = None  # CAMBIO: Ahora es opcional
    event_id: int
    quantity: int
    total_price: Decimal
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)