from sqlalchemy import (
    Column, Integer, String, ForeignKey, Numeric, TIMESTAMP, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from core.database import Base


class Organizer(Base):
    __tablename__ = "organizers"

    id_organizer = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    organization_name = Column(String(100), nullable=False)
    status = Column(String(20), default="draft")
    created_at = Column(TIMESTAMP, server_default=func.now())

    events = relationship("Event", back_populates="organizer")


class Event(Base):
    __tablename__ = "events"

    id_event = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("organizers.id_organizer", ondelete="CASCADE"), nullable=False)
    creator_user_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # NUEVO: ID del usuario creador
    title = Column(String(150), nullable=False)
    description = Column(Text)
    location = Column(String(150))
    start_datetime = Column(TIMESTAMP, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    capacity = Column(Integer)
    status = Column(String(20), default="draft")
    created_at = Column(TIMESTAMP, server_default=func.now())

    organizer = relationship("Organizer", back_populates="events")
    orders = relationship("Order", back_populates="event", cascade="all, delete")


class Order(Base):
    __tablename__ = "orders"

    id_order = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(UUID(as_uuid=True), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id_event", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())

    event = relationship("Event", back_populates="orders")
    payments = relationship("Payment", back_populates="order", cascade="all, delete")
    tickets = relationship("Ticket", back_populates="order", cascade="all, delete")


class Payment(Base):
    __tablename__ = "payments"

    id_payment = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        unique=True,
        index=True
    )

    order_id = Column(Integer, ForeignKey("orders.id_order", ondelete="CASCADE"), nullable=False)
    provider_txn_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(20), default="initiated")
    amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

    order = relationship("Order", back_populates="payments")


class Ticket(Base):
    __tablename__ = "tickets"

    id_ticket = Column(UUID(as_uuid=True), primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id_order", ondelete="CASCADE"), nullable=False)
    ticket_code = Column(UUID(as_uuid=True), unique=True, server_default=func.uuid_generate_v4())
    pdf_url = Column(String(255))
    qr_code = Column(Text)
    issued_at = Column(TIMESTAMP, server_default=func.now())

    order = relationship("Order", back_populates="tickets")