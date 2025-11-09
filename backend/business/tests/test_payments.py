# tests/test_payments.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from main import app
from uuid import uuid4

# --- DB setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_payments.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Fixture DB ---
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

# --- Fixture TestClient ---
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

# --- Helper Fixture: create Event and Order ---
@pytest.fixture(scope="function")
def create_test_order(test_client):
    # Create an event first
    event_data = {
        "title": "Test Event",
        "description": "Evento para testing",
        "location": "Bogotá",
        "start_datetime": "2025-12-15T20:00:00",
        "price": 100.0,
        "capacity": 500,
        "organizer_id": 1
    }
    event_resp = test_client.post("/events/", json=event_data)
    assert event_resp.status_code == 200
    event_id = event_resp.json()["id_event"]

    # Create order
    order_data = {
        "event_id": event_id,
        "quantity": 1,
        "status": "pending",
        "total_price": 100.0
    }
    order_resp = test_client.post("/orders/", json=order_data)
    assert order_resp.status_code == 201
    return order_resp.json()["id_order"]

# --- Tests ---
def test_create_payment(test_client, create_test_order):
    txn_id = str(uuid4())
    payment_data = {
        "order_id": create_test_order,
        "provider_txn_id": txn_id,
        "amount": "100.00"
    }
    response = test_client.post("/payments/", json=payment_data)
    assert response.status_code == 201
    data = response.json()
    assert data["order_id"] == create_test_order
    assert data["provider_txn_id"] == txn_id
    assert data["status"] == "initiated"
    assert str(data["amount"]) == "100.00"
    assert "id_payment" in data
    assert "created_at" in data
    assert "updated_at" in data

def test_get_payment_by_id(test_client, create_test_order):
    txn_id = str(uuid4())
    payment_data = {
        "order_id": create_test_order,
        "provider_txn_id": txn_id,
        "amount": "50.00"
    }
    resp = test_client.post("/payments/", json=payment_data)
    payment_id = resp.json()["id_payment"]

    response = test_client.get(f"/payments/{payment_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_payment"] == payment_id
    assert data["provider_txn_id"] == txn_id

def test_update_payment_status_valid(test_client, create_test_order):
    txn_id = str(uuid4())
    payment_data = {
        "order_id": create_test_order,
        "provider_txn_id": txn_id,
        "amount": "75.00"
    }
    resp = test_client.post("/payments/", json=payment_data)
    payment_id = resp.json()["id_payment"]

    update_data = {"status": "completed"}
    response = test_client.put(f"/payments/{payment_id}/status", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"

def test_update_payment_status_invalid(test_client, create_test_order):
    txn_id = str(uuid4())
    payment_data = {
        "order_id": create_test_order,
        "provider_txn_id": txn_id,
        "amount": "30.00"
    }
    resp = test_client.post("/payments/", json=payment_data)
    payment_id = resp.json()["id_payment"]

    update_data = {"status": "invalid_status"}
    response = test_client.put(f"/payments/{payment_id}/status", json=update_data)
    assert response.status_code == 400
    assert "Invalid status" in response.json()["detail"]

def test_get_payment_not_found(test_client):
    fake_id = str(uuid4())
    response = test_client.get(f"/payments/{fake_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Payment not found"
