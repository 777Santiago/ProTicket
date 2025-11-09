# tests/test_tickets.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timezone
from uuid import uuid4

from core.database import Base, get_db
from main import app
from models.models import Event, Order, Ticket

# Using SQLite for testing purposes
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_tickets.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DB Fixture
@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)

# Testclient Fixture
@pytest.fixture(scope="function")
def test_client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

# Event fixture
@pytest.fixture(scope="function")
def create_test_event(db):
    event = Event(
        id_event=1,
        title="Test Event",
        description="Event for testing tickets",
        location="Bogotá",
        start_datetime=datetime.now(timezone.utc),
        price=100.0,
        capacity=50,
        organizer_id=1
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

# Order fixture
@pytest.fixture(scope="function")
def create_test_order(db, create_test_event):
    order = Order(
        id_order=1,
        event_id=create_test_event.id_event,
        buyer_id=uuid4(),
        quantity=1,
        total_price=100.0,
        status="initiated",
        created_at=datetime.now(timezone.utc)
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

# Ticket fixture
@pytest.fixture(scope="function")
def create_test_ticket(db, create_test_order):
    ticket = Ticket(
        id_ticket=uuid4(),
        order_id=create_test_order.id_order,
        ticket_code=uuid4(),
        pdf_url="https://example.com/ticket.pdf",
        qr_code="QR_CODE_SAMPLE",
        issued_at=datetime.now(timezone.utc)
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

# Tests 
def test_create_ticket(test_client, create_test_order):
    ticket_data = {
        "order_id": create_test_order.id_order,
        "pdf_url": "https://example.com/new_ticket.pdf",
        "qr_code": "NEW_QR_CODE"
    }
    response = test_client.post("/tickets/", json=ticket_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["order_id"] == create_test_order.id_order
    assert data["pdf_url"] == ticket_data["pdf_url"]
    assert data["qr_code"] == ticket_data["qr_code"]
    assert "id_ticket" in data
    assert "ticket_code" in data
    assert "issued_at" in data

def test_get_ticket_by_id(test_client, create_test_ticket):
    response = test_client.get(f"/tickets/{create_test_ticket.id_ticket}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_ticket"] == str(create_test_ticket.id_ticket)

def test_get_tickets_by_order(test_client, create_test_order, create_test_ticket):
    response = test_client.get(f"/tickets/order/{create_test_order.id_order}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert str(create_test_ticket.id_ticket) in [t["id_ticket"] for t in data]

def test_get_ticket_by_code(test_client, create_test_ticket):
    response = test_client.get(f"/tickets/code/{create_test_ticket.ticket_code}")
    assert response.status_code == 200
    data = response.json()
    assert data["ticket_code"] == str(create_test_ticket.ticket_code)

def test_get_ticket_not_found(test_client):
    from uuid import uuid4
    response = test_client.get(f"/tickets/{uuid4()}")
    assert response.status_code == 404
