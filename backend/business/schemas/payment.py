# schemas/payment.py
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class PaymentBase(BaseModel):
    order_id: int
    provider_txn_id: str
    amount: Decimal


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    status: str


class PaymentOut(BaseModel):
    id_payment: UUID
    order_id: int
    provider_txn_id: str
    status: str
    amount: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
