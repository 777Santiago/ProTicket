from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.organizer import OrganizerCreate, OrganizerUpdate, OrganizerOut
from services.auth_service import get_user_info
from crud import crud_organizers

router = APIRouter(prefix="/organizers", tags=["Organizers"])

@router.post("/", response_model=OrganizerOut)
def create_organizer(
    organizer: OrganizerCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(get_user_info)
):
    return crud_organizers.create_organizer(db, organizer, user_data["id_user"])

@router.get("/{organizer_id}", response_model=OrganizerOut)
def get_organizer(organizer_id: int, db: Session = Depends(get_db)):
    return crud_organizers.get_organizer_by_id(db, organizer_id)

@router.get("/", response_model=list[OrganizerOut])
def list_organizers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_organizers.get_all_organizers(db, skip, limit)

@router.put("/{organizer_id}", response_model=OrganizerOut)
def update_organizer(organizer_id: int, organizer: OrganizerUpdate, db: Session = Depends(get_db)):
    return crud_organizers.update_organizer(db, organizer_id, organizer)

@router.delete("/{organizer_id}")
def delete_organizer(organizer_id: int, db: Session = Depends(get_db)):
    return crud_organizers.delete_organizer(db, organizer_id)