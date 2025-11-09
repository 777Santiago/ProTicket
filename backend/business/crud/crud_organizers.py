from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from models.models import Organizer
from schemas.organizer import OrganizerCreate, OrganizerUpdate
from fastapi import HTTPException, status
from uuid import UUID

def create_organizer(db: Session, organizer_data: OrganizerCreate, user_id: UUID):
    # Verify if an organizer already exists for that user_id
    existing = db.query(Organizer).filter(Organizer.user_id == user_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This user is already registered as an organizer"
        )

    new_organizer = Organizer(
        user_id=user_id,
        organization_name=organizer_data.organization_name,
        status=organizer_data.status or "draft"
    )
    db.add(new_organizer)
    db.commit()
    db.refresh(new_organizer)
    return new_organizer


def get_organizer_by_id(db: Session, organizer_id: int):
    organizer = db.query(Organizer).filter(Organizer.id_organizer == organizer_id).first()
    if not organizer:
        raise HTTPException(
            status_code=404,
            detail="Organizer not found"
        )
    return organizer


def get_all_organizers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Organizer).offset(skip).limit(limit).all()


def update_organizer(db: Session, organizer_id: int, organizer_data: OrganizerUpdate):
    organizer = db.query(Organizer).filter(Organizer.id_organizer == organizer_id).first()
    if not organizer:
        raise HTTPException(
            status_code=404,
            detail="Organizer not found"
        )

    for key, value in organizer_data.model_dump(exclude_unset=True).items():
        setattr(organizer, key, value)

    db.commit()
    db.refresh(organizer)
    return organizer


def delete_organizer(db: Session, organizer_id: int):
    organizer = db.query(Organizer).filter(Organizer.id_organizer == organizer_id).first()
    if not organizer:
        raise HTTPException(
            status_code=404,
            detail="Organizer not found"
        )

    db.delete(organizer)
    db.commit()
    return {"message": "Organizer deleted succesfully"}
