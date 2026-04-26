# FitConnect - Main Application with Database
# FastAPI + SQLAlchemy + JWT Authentication + RBAC

from fastapi import FastAPI, Depends, HTTPException, status, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta, date

# Import locali
from database import get_db, init_db, create_sample_data
from models import User, UserRoleEnum
import schemas
import crud
import auth
import models


def _role_value(role) -> str:
    return role.value if hasattr(role, "value") else str(role)

# Inizializza app
app = FastAPI(
    title="FitConnect API",
    description="Piattaforma per connettere Personal Trainer e Clienti - Con Database e Autenticazione",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS per frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event: Startup
@app.on_event("startup")
async def startup_event():
    """Inizializza database all'avvio"""
    print("🚀 Avvio FitConnect API v2.0...")
    init_db()
    create_sample_data()
    print("✅ Server pronto su http://localhost:8080")
    print("📖 Documentazione: http://localhost:8080/docs")

# ============================================================================
# ROOT & INFO
# ============================================================================

@app.get("/", tags=["Info"])
def root():
    """Endpoint root - Informazioni API"""
    return {
        "app": "FitConnect API v2.0",
        "status": "online",
        "description": "Piattaforma completa con database, autenticazione JWT e gestione permessi",
        "features": [
            "✅ Database SQLAlchemy (SQLite/PostgreSQL)",
            "✅ Autenticazione JWT con role-based access control",
            "✅ Gestione completa Utenti, Clienti, Trainer, Sessioni",
            "✅ Dashboard Admin con statistiche",
            "✅ Sistema permessi e gruppi",
            "✅ Gestione contatti"
        ],
        "endpoints": {
            "docs": "/docs",
            "auth": {
                "login": "POST /api/auth/login",
                "register": "POST /api/auth/register",
                "me": "GET /api/auth/me"
            },
            "users": "GET /api/users",
            "clients": "GET /api/clients",
            "trainers": "GET /api/trainers",
            "sessions": "GET /api/sessions",
            "admin": {
                "dashboard": "GET /api/admin/dashboard",
                "users": "GET /api/admin/users",
                "contacts": "GET /api/admin/contacts"
            }
        },
        "default_credentials": {
            "admin": "admin@fitconnect.com / admin123",
            "trainer": "marco.trainer@fitconnect.com / trainer123",
            "client": "luca.client@fitconnect.com / client123"
        }
    }

@app.get("/api/health", tags=["Info"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0"}

# ============================================================================
# AUTHENTICATION
# ============================================================================

@app.post("/api/auth/register", tags=["Auth"])
def register(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrazione nuovo utente.
    
    Ruoli disponibili: client, trainer, admin
    """
    # Endpoint pubblico: impedisce escalation privilegi tramite payload alterato.
    if user.role == schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La registrazione pubblica di account admin non è consentita"
        )

    # Verifica se email esiste già
    existing_user = crud.get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email già registrata"
        )
    
    # Crea utente
    new_user = crud.create_user(db, user=user)
    
    # Converti role a string se è un enum
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    
    # Se è un client, crea anche il profilo client
    if role_str == "client" and hasattr(user, 'client_data') and user.client_data:
        crud.create_client(db, client=user.client_data, user_id=new_user.id)
    
    # Se è un trainer, crea anche il profilo trainer
    if role_str == "trainer" and hasattr(user, 'trainer_data') and user.trainer_data:
        crud.create_trainer(db, trainer=user.trainer_data, user_id=new_user.id)
    
    # Log audit
    crud.create_audit_log(
        db,
        user_id=new_user.id,
        action="user_registered",
        resource_type="user",
        resource_id=new_user.id,
        details=f"New {role_str} registered"
    )
    
    # Prepara risposta - converti enum a string
    return {
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role.value if hasattr(new_user.role, 'value') else str(new_user.role),
        "created_at": new_user.created_at
    }

@app.post("/api/auth/login", response_model=schemas.Token, tags=["Auth"])
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login con email e password.
    
    Restituisce JWT access token.
    """
    # Autentica utente
    user = auth.authenticate_user(db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o password non corrette",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Crea access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={
            "user_id": user.id,
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
            "is_admin": user.is_admin
        },
        expires_delta=access_token_expires
    )
    
    # Log audit
    crud.create_audit_log(
        db,
        user_id=user.id,
        action="user_login",
        resource_type="user",
        resource_id=user.id
    )
    
    # Prepara risposta utente
    user_data = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@app.get("/api/auth/me", response_model=schemas.UserRead, tags=["Auth"])
def get_current_user_info(
    current_user: User = Depends(auth.get_current_user)
):
    """Ottiene informazioni sull'utente corrente"""
    return current_user

# ============================================================================
# USERS
# ============================================================================

@app.get("/api/users", response_model=List[schemas.UserRead], tags=["Users"])
def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Lista tutti gli utenti (solo admin)"""
    users = crud.get_users(db, skip=skip, limit=limit, role=role)
    return users


@app.post("/api/users", response_model=schemas.UserRead, tags=["Users"], status_code=201)
def create_user_by_admin(
    user: schemas.UserCreate,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Crea un nuovo utente (solo admin)."""
    existing_user = crud.get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email già registrata")

    new_user = crud.create_user(db, user=user)

    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="user_created",
        resource_type="user",
        resource_id=new_user.id,
        details=f"Created by admin {current_user.email}"
    )

    return new_user

@app.get("/api/users/{user_id}", response_model=schemas.UserRead, tags=["Users"])
def get_user(
    user_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ottiene dettagli utente"""
    # Verifica permessi: admin o stesso utente
    is_admin_user = current_user.is_admin or _role_value(current_user.role) == "admin"
    if not is_admin_user and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accesso negato")
    
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    return user

@app.put("/api/users/{user_id}", response_model=schemas.UserRead, tags=["Users"])
def update_user(
    user_id: int,
    user_data: dict = Body(...),
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Aggiorna utente"""
    # Verifica permessi
    is_admin_user = current_user.is_admin or _role_value(current_user.role) == "admin"
    if not is_admin_user and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accesso negato")
    
    updated_user = crud.update_user(db, user_id=user_id, user_data=user_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Log audit
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="user_updated",
        resource_type="user",
        resource_id=user_id,
        details=f"Updated by {current_user.email}"
    )
    
    return updated_user


@app.patch("/api/users/{user_id}/status", response_model=schemas.UserRead, tags=["Users"])
def update_user_status(
    user_id: int,
    payload: schemas.UserStatusUpdate,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Attiva/disattiva un utente (solo admin)."""
    target_user = crud.get_user(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    if target_user.id == current_user.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Non puoi disattivare il tuo account admin")

    updated_user = crud.update_user(db, user_id=user_id, user_data={"is_active": payload.is_active})
    if not updated_user:
        raise HTTPException(status_code=404, detail="Utente non trovato")

    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="user_status_updated",
        resource_type="user",
        resource_id=user_id,
        details=f"is_active={payload.is_active}"
    )

    return updated_user

@app.delete("/api/users/{user_id}", tags=["Users"])
def delete_user(
    user_id: int,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Elimina utente (solo admin)"""
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Utente non trovato")
    
    # Log audit
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="user_deleted",
        resource_type="user",
        resource_id=user_id,
        details=f"Deleted by {current_user.email}"
    )
    
    return {"message": "Utente eliminato con successo"}

# ============================================================================
# CLIENTS
# ============================================================================

@app.get("/api/clients", response_model=List[schemas.ClientRead], tags=["Clients"])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(auth.require_role(["admin", "trainer"])),
    db: Session = Depends(get_db)
):
    """Lista tutti i clienti (admin e trainer)"""
    clients = crud.get_clients(db, skip=skip, limit=limit)
    return clients

@app.get("/api/clients/{client_id}", response_model=schemas.ClientRead, tags=["Clients"])
def get_client(
    client_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ottiene dettagli cliente"""
    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    # Verifica permessi
    if not current_user.is_admin and client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accesso negato")
    
    return client


@app.get("/api/clients/profile/me", response_model=schemas.ClientRead, tags=["Clients"])
def get_my_client_profile(
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ottiene il profilo client dell'utente corrente"""
    profile = crud.get_client_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profilo client non trovato")
    return crud.get_client(db, client_id=profile.id)

@app.post("/api/clients", response_model=schemas.ClientRead, tags=["Clients"], status_code=201)
def create_client(
    client: schemas.ClientCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Crea profilo cliente per l'utente corrente"""
    # Verifica che l'utente sia un client
    if _role_value(current_user.role) != "client" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Solo gli utenti con ruolo 'client' possono creare un profilo cliente")
    
    # Verifica se esiste già
    existing = crud.get_client_by_user_id(db, user_id=current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Profilo cliente già esistente")
    
    new_client = crud.create_client(db, client=client, user_id=current_user.id)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="client_created",
        resource_type="client",
        resource_id=new_client.id
    )
    
    return new_client

@app.put("/api/clients/{client_id}", response_model=schemas.ClientRead, tags=["Clients"])
def update_client(
    client_id: int,
    client_data: dict,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Aggiorna profilo cliente"""
    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    # Verifica permessi
    if not current_user.is_admin and client.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accesso negato")
    
    updated_client = crud.update_client(db, client_id=client_id, client_data=client_data)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="client_updated",
        resource_type="client",
        resource_id=client_id
    )
    
    return updated_client

# ============================================================================
# TRAINERS
# ============================================================================

@app.get("/api/trainers", response_model=List[schemas.TrainerRead], tags=["Trainers"])
def list_trainers(
    skip: int = 0,
    limit: int = 100,
    location: Optional[str] = None,
    specialization: Optional[str] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Lista tutti i trainer (pubblico, senza autenticazione).
    
    Filtri disponibili:
    - location: città/zona
    - specialization: nome specializzazione
    - max_price: prezzo massimo orario
    """
    trainers = crud.get_trainers(
        db,
        skip=skip,
        limit=limit,
        location=location,
        specialization=specialization,
        max_price=max_price
    )
    return trainers

@app.get("/api/trainers/{trainer_id}", response_model=schemas.TrainerRead, tags=["Trainers"])
def get_trainer(
    trainer_id: int,
    db: Session = Depends(get_db)
):
    """Ottiene dettagli trainer (pubblico)"""
    trainer = crud.get_trainer(db, trainer_id=trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer non trovato")
    
    return trainer


@app.get("/api/trainers/profile/me", response_model=schemas.TrainerRead, tags=["Trainers"])
def get_my_trainer_profile(
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ottiene il profilo trainer dell'utente corrente"""
    profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profilo trainer non trovato")
    return crud.get_trainer(db, trainer_id=profile.id)

@app.post("/api/trainers", response_model=schemas.TrainerRead, tags=["Trainers"], status_code=201)
def create_trainer(
    trainer: schemas.TrainerCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Crea profilo trainer per l'utente corrente"""
    # Verifica che l'utente sia un trainer
    if _role_value(current_user.role) != "trainer" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Solo gli utenti con ruolo 'trainer' possono creare un profilo trainer")
    
    # Verifica se esiste già
    existing = crud.get_trainer_by_user_id(db, user_id=current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Profilo trainer già esistente")
    
    new_trainer = crud.create_trainer(db, trainer=trainer, user_id=current_user.id)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="trainer_created",
        resource_type="trainer",
        resource_id=new_trainer.id
    )
    
    return new_trainer

@app.put("/api/trainers/{trainer_id}", response_model=schemas.TrainerRead, tags=["Trainers"])
def update_trainer(
    trainer_id: int,
    trainer_data: dict,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Aggiorna profilo trainer"""
    trainer = crud.get_trainer(db, trainer_id=trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer non trovato")
    
    # Verifica permessi
    if not current_user.is_admin and trainer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accesso negato")
    
    updated_trainer = crud.update_trainer(db, trainer_id=trainer_id, trainer_data=trainer_data)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="trainer_updated",
        resource_type="trainer",
        resource_id=trainer_id
    )
    
    return updated_trainer


@app.get("/api/trainers/{trainer_id}/chat", response_model=List[schemas.ChatMessageRead], tags=["Trainers"])
def get_trainer_chat_messages(
    trainer_id: int,
    client_id: Optional[int] = None,
    limit: int = 100,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Restituisce i messaggi chat tra trainer e client."""
    trainer = crud.get_trainer(db, trainer_id=trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer non trovato")

    resolved_client_id = client_id
    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    if role_value == "client":
        client = crud.get_client_by_user_id(db, user_id=current_user.id)
        if not client:
            raise HTTPException(status_code=404, detail="Profilo client non trovato")
        resolved_client_id = client.id
    elif role_value == "trainer":
        trainer_profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
        if not trainer_profile or trainer_profile.id != trainer_id:
            raise HTTPException(status_code=403, detail="Puoi leggere solo le tue chat")
        if resolved_client_id is None:
            raise HTTPException(status_code=400, detail="client_id richiesto")
    else:
        if resolved_client_id is None:
            raise HTTPException(status_code=400, detail="client_id richiesto")

    messages = crud.get_chat_messages(
        db,
        trainer_id=trainer_id,
        client_id=resolved_client_id,
        limit=limit
    )
    return messages


@app.post("/api/trainers/{trainer_id}/chat", response_model=schemas.ChatMessageRead, tags=["Trainers"], status_code=201)
def send_trainer_chat_message(
    trainer_id: int,
    payload: schemas.ChatMessageCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Invia un messaggio chat tra trainer e client."""
    trainer = crud.get_trainer(db, trainer_id=trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer non trovato")

    role_value = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    resolved_client_id = payload.client_id

    if role_value == "client":
        client = crud.get_client_by_user_id(db, user_id=current_user.id)
        if not client:
            raise HTTPException(status_code=404, detail="Profilo client non trovato")
        resolved_client_id = client.id
    elif role_value == "trainer":
        trainer_profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
        if not trainer_profile or trainer_profile.id != trainer_id:
            raise HTTPException(status_code=403, detail="Puoi scrivere solo nelle tue chat")
        if resolved_client_id is None:
            raise HTTPException(status_code=400, detail="client_id richiesto")
    else:
        if resolved_client_id is None:
            raise HTTPException(status_code=400, detail="client_id richiesto")

    client = crud.get_client(db, client_id=resolved_client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")

    new_message = crud.create_chat_message(
        db,
        trainer_id=trainer_id,
        client_id=resolved_client_id,
        sender_user_id=current_user.id,
        payload=payload
    )

    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="chat_message_sent",
        resource_type="chat",
        resource_id=new_message.id,
        details=f"trainer_id={trainer_id}, client_id={resolved_client_id}"
    )

    return new_message


@app.get("/api/trainers/me/chats", response_model=List[schemas.TrainerChatConversationRead], tags=["Trainers"])
def get_my_trainer_chat_conversations(
    limit: int = 50,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Restituisce le conversazioni private del trainer autenticato."""
    if _role_value(current_user.role) != "trainer" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Endpoint disponibile solo per trainer")

    trainer_profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Profilo trainer non trovato")

    return crud.get_trainer_chat_conversations(db, trainer_id=trainer_profile.id, limit=limit)


@app.get("/api/trainers/me/chats/{client_id}", response_model=List[schemas.ChatMessageRead], tags=["Trainers"])
def get_my_trainer_chat_messages(
    client_id: int,
    limit: int = 100,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Restituisce i messaggi privati tra trainer autenticato e cliente selezionato."""
    if _role_value(current_user.role) != "trainer" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Endpoint disponibile solo per trainer")

    trainer_profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Profilo trainer non trovato")

    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")

    return crud.get_chat_messages(db, trainer_id=trainer_profile.id, client_id=client_id, limit=limit)


@app.post("/api/trainers/me/chats/{client_id}", response_model=schemas.ChatMessageRead, tags=["Trainers"], status_code=201)
def send_my_trainer_chat_message(
    client_id: int,
    payload: schemas.ChatMessageCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Invia un messaggio privato dal trainer autenticato al cliente selezionato."""
    if _role_value(current_user.role) != "trainer" and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Endpoint disponibile solo per trainer")

    trainer_profile = crud.get_trainer_by_user_id(db, user_id=current_user.id)
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Profilo trainer non trovato")

    client = crud.get_client(db, client_id=client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente non trovato")

    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Il messaggio non può essere vuoto")

    return crud.create_chat_message(
        db,
        trainer_id=trainer_profile.id,
        client_id=client_id,
        sender_user_id=current_user.id,
        payload=payload
    )

# ============================================================================
# SESSIONS
# ============================================================================

@app.get("/api/sessions", response_model=List[schemas.SessionRead], tags=["Sessions"])
def list_sessions(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    trainer_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista sessioni.
    
    Se non admin/trainer, vede solo le proprie sessioni.
    """
    # Se non admin, filtra per user corrente
    role_value = _role_value(current_user.role)

    if not current_user.is_admin and role_value == "client":
        client = crud.get_client_by_user_id(db, user_id=current_user.id)
        if client:
            client_id = client.id
    
    if not current_user.is_admin and role_value == "trainer":
        trainer = crud.get_trainer_by_user_id(db, user_id=current_user.id)
        if trainer:
            trainer_id = trainer.id

    sessions = crud.get_sessions(
        db,
        skip=skip,
        limit=limit,
        client_id=client_id,
        trainer_id=trainer_id,
        status=status,
        date_from=date_from,
        date_to=date_to
    )
    
    return sessions

@app.get("/api/sessions/{session_id}", response_model=schemas.SessionRead, tags=["Sessions"])
def get_session(
    session_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Ottiene dettagli sessione"""
    session = crud.get_session(db, session_id=session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessione non trovata")
    
    # Verifica permessi
    if not current_user.is_admin:
        if session.client.user_id != current_user.id and session.trainer.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accesso negato")
    
    return session

@app.post("/api/sessions", response_model=schemas.SessionRead, tags=["Sessions"], status_code=201)
def create_session(
    session: schemas.SessionCreate,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Prenota nuova sessione.
    
    Verifica disponibilità trainer e previene conflitti.
    """
    # Verifica che l'utente sia autorizzato
    if _role_value(current_user.role) == "client":
        client = crud.get_client_by_user_id(db, user_id=current_user.id)
        if not client or client.id != session.client_id:
            raise HTTPException(status_code=403, detail="Puoi prenotare sessioni solo per il tuo profilo")
    
    new_session = crud.create_session(db, session=session)
    
    if not new_session:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Il trainer è già impegnato in questo orario"
        )
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="session_created",
        resource_type="session",
        resource_id=new_session.id,
        details=f"Session booked for {session.date} at {session.time}"
    )
    
    return new_session

@app.put("/api/sessions/{session_id}", response_model=schemas.SessionRead, tags=["Sessions"])
def update_session(
    session_id: int,
    session_data: dict,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Aggiorna sessione (solo trainer e admin)"""
    session = crud.get_session(db, session_id=session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessione non trovata")
    
    # Verifica permessi
    if not current_user.is_admin and session.trainer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo il trainer può modificare la sessione")
    
    updated_session = crud.update_session(db, session_id=session_id, session_data=session_data)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="session_updated",
        resource_type="session",
        resource_id=session_id
    )
    
    return updated_session

@app.delete("/api/sessions/{session_id}", tags=["Sessions"])
def cancel_session(
    session_id: int,
    current_user: User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Cancella (annulla) sessione"""
    session = crud.get_session(db, session_id=session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Sessione non trovata")
    
    # Verifica permessi
    if not current_user.is_admin:
        if session.client.user_id != current_user.id and session.trainer.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accesso negato")
    
    cancelled_session = crud.cancel_session(db, session_id=session_id)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="session_cancelled",
        resource_type="session",
        resource_id=session_id
    )
    
    return {"message": "Sessione annullata con successo", "session": cancelled_session}

# ============================================================================
# SPECIALIZATIONS
# ============================================================================

@app.get("/api/specializations", response_model=List[schemas.SpecializationRead], tags=["Specializations"])
def list_specializations(db: Session = Depends(get_db)):
    """Lista tutte le specializzazioni (pubblico)"""
    return crud.get_specializations(db)

@app.post("/api/specializations", response_model=schemas.SpecializationRead, tags=["Specializations"])
def create_specialization(
    spec: schemas.SpecializationCreate,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Crea nuova specializzazione (solo admin)"""
    new_spec = crud.create_specialization(db, spec=spec)
    
    crud.create_audit_log(
        db,
        user_id=current_user.id,
        action="specialization_created",
        resource_type="specialization",
        resource_id=new_spec.id
    )
    
    return new_spec

# ============================================================================
# CONTACTS
# ============================================================================

@app.post("/api/contacts", response_model=schemas.ContactRead, tags=["Contacts"], status_code=201)
def create_contact(
    contact: schemas.ContactCreate,
    db: Session = Depends(get_db)
):
    """Invia messaggio di contatto (pubblico, senza auth)"""
    new_contact = crud.create_contact(db, contact=contact)
    
    crud.create_audit_log(
        db,
        user_id=None,
        action="contact_submitted",
        resource_type="contact",
        resource_id=new_contact.id,
        details=f"From: {contact.email}"
    )
    
    return new_contact

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.get("/api/admin/dashboard", tags=["Admin"])
def admin_dashboard(
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Dashboard amministratore con statistiche"""
    stats = crud.get_dashboard_stats(db)
    
    return {
        "admin": {
            "name": current_user.name,
            "email": current_user.email
        },
        "statistics": stats,
        "permissions": auth.get_user_permissions(current_user),
        "groups": auth.get_user_groups(current_user)
    }

@app.get("/api/admin/contacts", response_model=List[schemas.ContactRead], tags=["Admin"])
def admin_list_contacts(
    skip: int = 0,
    limit: int = 100,
    is_read: Optional[bool] = None,
    current_user: User = Depends(auth.require_permission("manage_users")),
    db: Session = Depends(get_db)
):
    """Lista messaggi di contatto (admin)"""
    contacts = crud.get_contacts(db, skip=skip, limit=limit, is_read=is_read)
    return contacts

@app.put("/api/admin/contacts/{contact_id}/read", response_model=schemas.ContactRead, tags=["Admin"])
def mark_contact_read(
    contact_id: int,
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Marca messaggio come letto"""
    contact = crud.mark_contact_read(db, contact_id=contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Messaggio non trovato")
    
    return contact

@app.get("/api/admin/groups", response_model=List[schemas.GroupRead], tags=["Admin"])
def list_groups(
    current_user: User = Depends(auth.require_admin),
    db: Session = Depends(get_db)
):
    """Lista gruppi e permessi"""
    groups = crud.get_groups(db)
    return groups

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )
