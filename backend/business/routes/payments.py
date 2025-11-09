# routes/payments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from core.database import get_db
from schemas.payment import PaymentCreate, PaymentOut, PaymentUpdate
from crud import crud_payments

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    new_payment, error = crud_payments.create_payment(db, payment_data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return new_payment


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: UUID, db: Session = Depends(get_db)):
    payment = crud_payments.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.put("/{payment_id}/status", response_model=PaymentOut)
def update_payment_status(payment_id: UUID, update_data: PaymentUpdate, db: Session = Depends(get_db)):
    payment, error = crud_payments.update_payment_status(db, payment_id, update_data.status)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return payment
