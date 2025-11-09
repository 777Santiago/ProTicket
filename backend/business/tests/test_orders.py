import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from main import app


# Temporal Database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_orders.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Replace dependency to use test database
app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)


# FIXTURES 
@pytest.fixture(scope="module")
def test_client():
    yield client


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# TESTS 

def test_create_order(test_client):
    # Must creat an order correctly    
    # Must create an event first to reference in the order
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

    order_data = {
        "event_id": event_id,
        "quantity": 2,
        "status": "pending",
        "total_amount": 200.0
    }

    response = test_client.post("/orders/", json=order_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["event_id"] == event_id
    assert data["quantity"] == 2
    assert data["status"] == "pending"
    assert "id_order" in data


def test_get_order_by_id(test_client):    
    # Get an existing order
    orders = test_client.get("/orders/user/123e4567-e89b-12d3-a456-426614174000").json()
    order_id = orders[0]["id_order"]

    response = test_client.get(f"/orders/{order_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_order"] == order_id
    assert "status" in data


def test_get_order_not_found(test_client):    
    # Must return 404 if order does not exist
    response = test_client.get("/orders/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Orden not found"


def test_get_orders_by_user(test_client):    
    # Must return orders for a specific user
    buyer_id = "123e4567-e89b-12d3-a456-426614174000"
    response = test_client.get(f"/orders/user/{buyer_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "buyer_id" in data[0]


def test_get_orders_by_user_not_found(test_client):
    # Must return 404 if user has no orders
    buyer_id = "00000000-0000-0000-0000-000000000000"
    response = test_client.get(f"/orders/user/{buyer_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "User has no orders"


def test_update_order_status(test_client):    
    # Must update status of an existing order
    # Get an existing order first
    buyer_id = "123e4567-e89b-12d3-a456-426614174000"
    orders = test_client.get(f"/orders/user/{buyer_id}").json()
    order_id = orders[0]["id_order"]

    update_data = {"status": "paid"}
    response = test_client.put(f"/orders/{order_id}/status", json=update_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "paid"


def test_update_order_status_invalid(test_client):    
    # Must return 400 if trying to update with an invalid status
    # First, ensure there is an order to update    
    update_data = {"status": "invalid_status"}
    response = test_client.put("/orders/1/status", json=update_data)
    assert response.status_code == 400
