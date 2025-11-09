from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class OrganizerBase(BaseModel):
    organization_name: str
    status: Optional[str] = "draft"


class OrganizerCreate(OrganizerBase):
    pass


class OrganizerUpdate(BaseModel):
    organization_name: Optional[str] = None
    status: Optional[str] = None


class OrganizerOut(OrganizerBase):
    id_organizer: int
    user_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
