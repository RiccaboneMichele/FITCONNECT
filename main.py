"""
FitConnect - API Dimostrativa
Progetto senza database reale - Solo dati fittizi per dimostrazione

NOTA: Questo progetto è DIMOSTRATIVO
- NON utilizza database reale
- NON utilizza SQLAlchemy/ORM
- Gli endpoint restituiscono dati fittizi solo a scopo dimostrativo
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime, date, time
from schemas import (
    UserCreate, UserRead,
    SpecializationCreate, SpecializationRead,
    TrainerCreate, TrainerRead, TrainerSearchResponse,
    SessionCreate, SessionRead, SessionUpdate, SessionStatus
)


# ============================================================================
# INIZIALIZZAZIONE FASTAPI
# ============================================================================

app = FastAPI(
    title="FitConnect API",
    description="Piattaforma di matching trainer-client - Versione Dimostrativa",
    version="1.0.0"
)

# CORS middleware per demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# DATABASE FITTIZIO (SOLO PER DIMOSTRAZIONE)
# ============================================================================

# Dati fittizi - NON è un database reale
USERS_DB = [
    {
        "id": 1,
        "email": "marco.rossi@example.com",
        "name": "Marco Rossi",
        "role": "trainer",
        "password_hash": "hashed_pwd_1",
        "created_at": datetime(2026, 1, 15, 10, 30, 0)
    },
    {
        "id": 2,
        "email": "anna.bianchi@example.com",
        "name": "Anna Bianchi",
        "role": "trainer",
        "password_hash": "hashed_pwd_2",
        "created_at": datetime(2026, 1, 20, 14, 45, 0)
    },
    {
        "id": 3,
        "email": "luca.verdi@example.com",
        "name": "Luca Verdi",
        "role": "client",
        "password_hash": "hashed_pwd_3",
        "created_at": datetime(2026, 2, 1, 9, 15, 0)
    }
]

SPECIALIZATIONS_DB = [
    {"id": 1, "name": "Powerlifting"},
    {"id": 2, "name": "CrossFit"},
    {"id": 3, "name": "Yoga"},
    {"id": 4, "name": "Cardio"},
    {"id": 5, "name": "Pilates"}
]

TRAINERS_DB = [
    {
        "id": 1,
        "user_id": 1,
        "bio": "Specializzato in powerlifting con 10 anni di esperienza",
        "hourly_rate": 50.0,
        "location": "Milano",
        "specialization_ids": [1, 2],
        "created_at": datetime(2026, 1, 15, 10, 30, 0)
    },
    {
        "id": 2,
        "user_id": 2,
        "bio": "Istruttrice di yoga e pilates, diplomata IYENGAR",
        "hourly_rate": 40.0,
        "location": "Roma",
        "specialization_ids": [3, 5],
        "created_at": datetime(2026, 1, 20, 14, 45, 0)
    }
]

SESSIONS_DB = [
    {
        "id": 101,
        "date": "2026-03-15",
        "time": "10:00",
        "status": "scheduled",
        "trainer_id": 1,
        "user_id": 3,
        "created_at": datetime(2026, 3, 1, 11, 0, 0)
    }
]

NEXT_ID_TRACKER = {
    "users": 4,
    "trainers": 3,
    "sessions": 102
}


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_user_by_id(user_id: int) -> Optional[dict]:
    """Cerca utente per ID"""
    return next((u for u in USERS_DB if u["id"] == user_id), None)


def get_trainer_by_id(trainer_id: int) -> Optional[dict]:
    """Cerca trainer per ID"""
    return next((t for t in TRAINERS_DB if t["id"] == trainer_id), None)


def get_trainer_by_user_id(user_id: int) -> Optional[dict]:
    """Cerca trainer per user_id"""
    return next((t for t in TRAINERS_DB if t["user_id"] == user_id), None)


def email_exists(email: str) -> bool:
    """Controlla se email è già registrata"""
    return any(u["email"] == email for u in USERS_DB)


def format_trainer_for_search(trainer: dict) -> TrainerSearchResponse:
    """Formatta trainer per risposta search"""
    user = get_user_by_id(trainer["user_id"])
    spec_names = [
        s["name"] for s in SPECIALIZATIONS_DB
        if s["id"] in trainer["specialization_ids"]
    ]
    return TrainerSearchResponse(
        id=trainer["id"],
        name=user["name"] if user else "Unknown",
        location=trainer["location"],
        hourly_rate=trainer["hourly_rate"],
        bio=trainer["bio"],
        specializations=spec_names
    )


# ============================================================================
# ENDPOINT: ROOT
# ============================================================================

@app.get("/")
def root():
    """Endpoint radice - verifica se API è online"""
    return {
        "message": "Benvenuto su FitConnect! 🏋️ La piattaforma che connette personal trainer e clienti",
        "status": "online",
        "version": "1.0.0",
        "descrizione": "Trova il tuo trainer ideale, prenota sessioni di allenamento personalizzate",
        "note": "⚠️ DEMO: Progetto dimostrativo con dati fittizi - Nessun database reale",
        "endpoints_principali": {
            "documentazione": "/docs - Prova gli endpoint interattivamente!",
            "ricerca_trainer": "/api/trainers/search?location=Milano",
            "specializzazioni": "/api/specializations",
            "health_check": "/health"
        },
        "esempi_utilizzo": {
            "caso_1": "Cliente cerca trainer di Yoga a Roma: GET /api/trainers/search?location=Roma&specialization=Yoga",
            "caso_2": "Trainer si registra sulla piattaforma: POST /api/trainers/register",
            "caso_3": "Cliente prenota sessione: POST /api/sessions con data e ora desiderata"
        },
        "dati_demo_disponibili": {
            "trainer_milano": "Marco Rossi - Powerlifting & CrossFit (€50/h)",
            "trainer_roma": "Anna Bianchi - Yoga & Pilates (€40/h)",
            "specializzazioni": ["Powerlifting", "CrossFit", "Yoga", "Cardio", "Pilates"]
        }
    }


# ============================================================================
# ENDPOINT: USERS
# ============================================================================

@app.post("/api/users/register", response_model=UserRead, status_code=201)
def register_user(user: UserCreate):
    """
    Registra un nuovo utente (trainer o client)
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    # Validazione email
    if email_exists(user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Crea nuovo utente (simulato)
    user_id = NEXT_ID_TRACKER["users"]
    NEXT_ID_TRACKER["users"] += 1

    new_user = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "password_hash": f"hashed_{user.password}",  # Solo per demo
        "created_at": datetime.now()
    }

    USERS_DB.append(new_user)

    return UserRead(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        role=new_user["role"],
        created_at=new_user["created_at"]
    )


# ============================================================================
# ENDPOINT: SPECIALIZATIONS
# ============================================================================

@app.post("/api/specializations", response_model=SpecializationRead, status_code=201)
def create_specialization(spec: SpecializationCreate):
    """
    Crea una nuova specializzazione
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    # Controlla duplicati
    if any(s["name"].lower() == spec.name.lower() for s in SPECIALIZATIONS_DB):
        raise HTTPException(
            status_code=400,
            detail="Specialization already exists"
        )

    spec_id = max((s["id"] for s in SPECIALIZATIONS_DB), default=0) + 1
    new_spec = {"id": spec_id, "name": spec.name}
    SPECIALIZATIONS_DB.append(new_spec)

    return SpecializationRead(id=new_spec["id"], name=new_spec["name"])


@app.get("/api/specializations", response_model=List[SpecializationRead])
def list_specializations():
    """
    Elenca tutte le specializzazioni disponibili
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    return [
        SpecializationRead(id=s["id"], name=s["name"])
        for s in SPECIALIZATIONS_DB
    ]


# ============================================================================
# ENDPOINT: TRAINERS
# ============================================================================

@app.post("/api/trainers/register", response_model=TrainerRead, status_code=201)
def register_trainer(trainer: TrainerCreate):
    """
    Registra un nuovo personal trainer
    
    Validazioni:
    - user_id deve esistere e non essere già trainer
    - hourly_rate > 0
    - specialization_ids devono esistere
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    # Verifica user_id
    user = get_user_by_id(trainer.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verifica che user non sia già trainer
    if get_trainer_by_user_id(trainer.user_id):
        raise HTTPException(
            status_code=400,
            detail="User is already registered as trainer"
        )

    # Verifica specializzazioni
    for spec_id in trainer.specialization_ids:
        if not any(s["id"] == spec_id for s in SPECIALIZATIONS_DB):
            raise HTTPException(
                status_code=400,
                detail=f"Specialization {spec_id} not found"
            )

    # Crea trainer (simulato)
    trainer_id = NEXT_ID_TRACKER["trainers"]
    NEXT_ID_TRACKER["trainers"] += 1

    new_trainer = {
        "id": trainer_id,
        "user_id": trainer.user_id,
        "bio": trainer.bio,
        "hourly_rate": trainer.hourly_rate,
        "location": trainer.location,
        "specialization_ids": trainer.specialization_ids,
        "created_at": datetime.now()
    }

    TRAINERS_DB.append(new_trainer)

    # Costruisci risposta TrainerRead
    spec_list = [
        SpecializationRead(id=s["id"], name=s["name"])
        for s in SPECIALIZATIONS_DB
        if s["id"] in trainer.specialization_ids
    ]

    return TrainerRead(
        id=new_trainer["id"],
        user_id=new_trainer["user_id"],
        user=UserRead(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        ),
        bio=new_trainer["bio"],
        hourly_rate=new_trainer["hourly_rate"],
        location=new_trainer["location"],
        specializations=spec_list,
        created_at=new_trainer["created_at"]
    )


@app.get("/api/trainers/search", response_model=List[TrainerSearchResponse])
def search_trainers(
    location: Optional[str] = Query(None, description="Filtra per città"),
    specialization: Optional[str] = Query(None, description="Filtra per specializzazione"),
    max_rate: Optional[float] = Query(None, description="Tariffa massima oraria")
):
    """
    Ricerca trainer con filtri opzionali
    
    Query parameters:
    - location: case-insensitive partial match
    - specialization: exact match
    - max_rate: hourly_rate <= max_rate
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    results = []

    for trainer in TRAINERS_DB:
        # Filtro location
        if location and location.lower() not in trainer["location"].lower():
            continue

        # Filtro max_rate
        if max_rate is not None and trainer["hourly_rate"] > max_rate:
            continue

        # Filtro specialization
        if specialization:
            spec_names = [s["name"] for s in SPECIALIZATIONS_DB if s["id"] in trainer["specialization_ids"]]
            if specialization not in spec_names:
                continue

        results.append(format_trainer_for_search(trainer))

    return results


# ============================================================================
# ENDPOINT: SESSIONS
# ============================================================================

@app.post("/api/sessions", response_model=SessionRead, status_code=201)
def book_session(session: SessionCreate):
    """
    Prenota una sessione di allenamento
    
    Validazioni:
    - date formato YYYY-MM-DD
    - time formato HH:MM
    - trainer_id e user_id devono esistere
    - Nessun conflitto di orario per lo stesso trainer
    - Status deve essere valido
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    # Verifica trainer
    trainer = get_trainer_by_id(session.trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    # Verifica user
    user = get_user_by_id(session.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verifica formato data
    try:
        datetime.strptime(session.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format (YYYY-MM-DD)"
        )

    # Verifica formato ora
    try:
        datetime.strptime(session.time, "%H:%M")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid time format (HH:MM)"
        )

    # Verifica conflitto orario
    for existing_session in SESSIONS_DB:
        if (existing_session["date"] == session.date and
            existing_session["time"] == session.time and
            existing_session["trainer_id"] == session.trainer_id and
            existing_session["status"] != "cancelled"):
            raise HTTPException(
                status_code=400,
                detail="This time slot is already booked"
            )

    # Crea sessione (simulata)
    session_id = NEXT_ID_TRACKER["sessions"]
    NEXT_ID_TRACKER["sessions"] += 1

    new_session = {
        "id": session_id,
        "date": session.date,
        "time": session.time,
        "status": session.status,
        "trainer_id": session.trainer_id,
        "user_id": session.user_id,
        "created_at": datetime.now()
    }

    SESSIONS_DB.append(new_session)

    # Costruisci risposta
    return SessionRead(
        id=new_session["id"],
        date=new_session["date"],
        time=new_session["time"],
        status=new_session["status"],
        trainer_id=new_session["trainer_id"],
        user_id=new_session["user_id"],
        created_at=new_session["created_at"],
        trainer=TrainerRead(
            id=trainer["id"],
            user_id=trainer["user_id"],
            user=UserRead(
                id=get_user_by_id(trainer["user_id"])["id"],
                email=get_user_by_id(trainer["user_id"])["email"],
                name=get_user_by_id(trainer["user_id"])["name"],
                role=get_user_by_id(trainer["user_id"])["role"],
                created_at=get_user_by_id(trainer["user_id"])["created_at"]
            ),
            bio=trainer["bio"],
            hourly_rate=trainer["hourly_rate"],
            location=trainer["location"],
            specializations=[
                SpecializationRead(id=s["id"], name=s["name"])
                for s in SPECIALIZATIONS_DB
                if s["id"] in trainer["specialization_ids"]
            ],
            created_at=trainer["created_at"]
        ),
        user=UserRead(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )


@app.patch("/api/sessions/{session_id}", response_model=SessionRead)
def update_session_status(session_id: int, update: SessionUpdate):
    """
    Aggiorna lo status di una sessione
    
    Status validi: scheduled, completed, cancelled
    
    NOTA: Questo endpoint è DIMOSTRATIVO
    """
    session = next((s for s in SESSIONS_DB if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Aggiorna status (simulato)
    session["status"] = update.status

    # Costruisci risposta
    trainer = get_trainer_by_id(session["trainer_id"])
    user = get_user_by_id(session["user_id"])
    trainer_user = get_user_by_id(trainer["user_id"])

    return SessionRead(
        id=session["id"],
        date=session["date"],
        time=session["time"],
        status=session["status"],
        trainer_id=session["trainer_id"],
        user_id=session["user_id"],
        created_at=session["created_at"],
        trainer=TrainerRead(
            id=trainer["id"],
            user_id=trainer["user_id"],
            user=UserRead(
                id=trainer_user["id"],
                email=trainer_user["email"],
                name=trainer_user["name"],
                role=trainer_user["role"],
                created_at=trainer_user["created_at"]
            ),
            bio=trainer["bio"],
            hourly_rate=trainer["hourly_rate"],
            location=trainer["location"],
            specializations=[
                SpecializationRead(id=s["id"], name=s["name"])
                for s in SPECIALIZATIONS_DB
                if s["id"] in trainer["specialization_ids"]
            ],
            created_at=trainer["created_at"]
        ),
        user=UserRead(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"]
        )
    )


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
def health_check():
    """Endpoint di health check per monitoring"""
    return {"status": "healthy", "timestamp": datetime.now()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
