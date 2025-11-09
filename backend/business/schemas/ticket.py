from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class TicketBase(BaseModel):
    order_id: int

class TicketCreate(TicketBase):
    pdf_url: Optional[str] = None
    qr_code: Optional[str] = None

class TicketOut(BaseModel):
    id_ticket: UUID
    order_id: int
    ticket_code: UUID
    pdf_url: Optional[str]
    qr_code: Optional[str]
    issued_at: datetime

    model_config = ConfigDict(from_attributes=True)
