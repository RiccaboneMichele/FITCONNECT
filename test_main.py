import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app

TEST_DATABASE_URL = "sqlite:///./test_fitconnect.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(setup_db):
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_register_trainer(client):
    payload = {
        "user": {
            "email": "trainer@example.com",
            "name": "Mario Rossi",
            "role": "trainer",
            "password": "secret123",
        },
        "bio": "Experienced personal trainer",
        "hourly_rate": 50.0,
        "location": "Roma",
        "specialization_ids": [],
    }
    response = client.post("/api/trainers/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "trainer@example.com"
    assert data["location"] == "Roma"
    assert data["hourly_rate"] == 50.0


def test_register_trainer_duplicate_email(client):
    payload = {
        "user": {
            "email": "dup@example.com",
            "name": "Trainer One",
            "role": "trainer",
            "password": "secret123",
        },
        "hourly_rate": 40.0,
        "location": "Milano",
        "specialization_ids": [],
    }
    client.post("/api/trainers/register", json=payload)
    response = client.post("/api/trainers/register", json=payload)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_search_trainers_empty(client):
    response = client.get("/api/trainers/search")
    assert response.status_code == 200
    assert response.json() == []


def test_search_trainers_with_filters(client):
    payload = {
        "user": {
            "email": "search_trainer@example.com",
            "name": "Luigi Bianchi",
            "role": "trainer",
            "password": "pass123",
        },
        "bio": "Yoga specialist",
        "hourly_rate": 35.0,
        "location": "Firenze",
        "specialization_ids": [],
    }
    client.post("/api/trainers/register", json=payload)

    response = client.get("/api/trainers/search?location=Firenze")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["location"] == "Firenze"

    response = client.get("/api/trainers/search?max_rate=40")
    assert response.status_code == 200
    assert len(response.json()) == 1

    response = client.get("/api/trainers/search?max_rate=20")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_book_session(client):
    trainer_payload = {
        "user": {
            "email": "book_trainer@example.com",
            "name": "Anna Verdi",
            "role": "trainer",
            "password": "pass123",
        },
        "hourly_rate": 60.0,
        "location": "Napoli",
        "specialization_ids": [],
    }
    trainer_resp = client.post("/api/trainers/register", json=trainer_payload)
    assert trainer_resp.status_code == 201
    trainer_data = trainer_resp.json()
    trainer_id = trainer_data["id"]
    user_id = trainer_data["user_id"]

    session_payload = {
        "date": "2026-04-01",
        "time": "10:00",
        "status": "pending",
        "trainer_id": trainer_id,
        "user_id": user_id,
    }
    response = client.post("/api/sessions", json=session_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["date"] == "2026-04-01"
    assert data["time"] == "10:00"
    assert data["status"] == "pending"


def test_book_session_invalid_trainer(client):
    session_payload = {
        "date": "2026-04-01",
        "time": "10:00",
        "status": "pending",
        "trainer_id": 9999,
        "user_id": 1,
    }
    response = client.post("/api/sessions", json=session_payload)
    assert response.status_code == 404
    assert "Trainer not found" in response.json()["detail"]
