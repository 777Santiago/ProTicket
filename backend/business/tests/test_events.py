import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from core.database import Base, get_db
from main import app

# Create a temporary database for testing (in memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database dependency override for tests
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Override the get_db dependency to use the testing database
app.dependency_overrides[get_db] = override_get_db

# We create the tables in the temporary database
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

def test_create_event(test_client, monkeypatch):    
    # Must create an event correctly if the user has 'organizer' role

    def mock_get_user_info(user_id: str):
        return {"id": user_id, "role": "organizer"}
    
    from services import auth_service
    monkeypatch.setattr(auth_service, "get_user_info", mock_get_user_info)

    event_data = {
        "title": "Rock Festival",
        "description": "Concierto de rock en vivo",
        "location": "Bogotá",
        "start_datetime": "2025-12-15T20:00:00",
        "price": 100.0,
        "capacity": 500,
        "organizer_id": 1   # 👈 aquí el cambio
    }

    response = test_client.post("/events/", json=event_data)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == "Rock Festival"
    assert data["location"] == "Bogotá"



def test_get_all_events(test_client):    
    # Must return a list of events
    response = test_client.get("/events/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_event_by_id(test_client):        
    # first, create an event to ensure there is one to fetch
    # Obtain an event created in the previous test
    events = test_client.get("/events/").json()
    event_id = events[0]["id_event"]

    response = test_client.get(f"/events/{event_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id_event"] == event_id
    assert "title" in data


def test_get_event_not_found(test_client):    
    # Attempt to get a non-existent event
    response = test_client.get("/events/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"


def test_delete_event(test_client):    
    event_data = {
        "title": "Jazz Night",
        "description": "Noche de jazz en Medellín",
        "location": "Medellín",
        "start_datetime": "2025-12-25T20:00:00",
        "price": 80.0,
        "capacity": 200,
        "organizer_id": 1   # 👈 aquí también
    }
    create_resp = test_client.post("/events/", json=event_data)
    event_id = create_resp.json()["id_event"]



def test_delete_event_not_found(test_client):    
    # Must return 404 when trying to delete a non-existent event
    response = test_client.delete("/events/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Event not found"
