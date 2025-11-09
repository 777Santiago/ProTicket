# crud/crud_payments.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.models import Payment, Order
from schemas.payment import PaymentCreate
from uuid import UUID
from datetime import datetime, timezone

def create_payment(db: Session, payment_data: PaymentCreate):
    order = db.query(Order).filter(Order.id_order == payment_data.order_id).first()
    if not order:
        return None, "Order not found"
    
    # Validate that the same provider_txn_id does not exist
    existing_payment = db.query(Payment).filter(Payment.provider_txn_id == payment_data.provider_txn_id).first()
    if existing_payment:
        return None, "Transaction with this provider_txn_id already exists"

    try:
        new_payment = Payment(
            order_id=payment_data.order_id,
            provider_txn_id=payment_data.provider_txn_id,
            amount=payment_data.amount,
        )
        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)
        return new_payment, None
    except SQLAlchemyError as e:
        db.rollback()
        return None, f"Error creating payment: {str(e)}"


def get_payment_by_id(db: Session, payment_id: UUID):
    return db.query(Payment).filter(Payment.id_payment == payment_id).first()


def update_payment_status(db: Session, payment_id: UUID, new_status: str):
    payment = db.query(Payment).filter(Payment.id_payment == payment_id).first()
    if not payment:
        return None, "Payment not found"

    valid_status = ["initiated", "completed", "failed", "refunded"]
    if new_status not in valid_status:
        return None, f"Invalid status. Must be one of: {', '.join(valid_status)}"

    try:
        payment.status = new_status
        payment.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(payment)
        return payment, None
    except SQLAlchemyError as e:
        db.rollback()
        return None, f"Error updating payment status: {str(e)}"
