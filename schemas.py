"""
FitConnect - Schemi Pydantic per validazione dati
Compito 1B: Definizione completa di tutti i modelli dati
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMERAZIONI
# ============================================================================

class UserRole(str, Enum):
    """Ruoli degli utenti nel sistema"""
    TRAINER = "trainer"
    CLIENT = "client"


class SessionStatus(str, Enum):
    """Stati possibili di una sessione"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ============================================================================
# USER MODELS
# ============================================================================

class UserBase(BaseModel):
    """Campi comuni nel modello User"""
    email: EmailStr = Field(..., description="Email unica dell'utente")
    name: str = Field(..., min_length=1, max_length=100, description="Nome completo")
    role: UserRole = Field(..., description="Ruolo: trainer o client")


class UserCreate(UserBase):
    """Schema per creazione utente (include password)"""
    password: str = Field(..., min_length=6, description="Password (min 6 caratteri)")


class UserRead(UserBase):
    """Schema per lettura utente (esclude password)"""
    id: int = Field(..., description="ID univoco utente")
    created_at: datetime = Field(..., description="Data/ora creazione")

    class Config:
        from_attributes = True


# ============================================================================
# SPECIALIZATION MODELS
# ============================================================================

class SpecializationBase(BaseModel):
    """Campi comuni nel modello Specialization"""
    name: str = Field(..., min_length=1, max_length=50, description="Nome specializzazione")


class SpecializationCreate(SpecializationBase):
    """Schema per creazione specializzazione"""
    pass


class SpecializationRead(SpecializationBase):
    """Schema per lettura specializzazione"""
    id: int = Field(..., description="ID univoco specializzazione")

    class Config:
        from_attributes = True


# ============================================================================
# TRAINER MODELS
# ============================================================================

class TrainerBase(BaseModel):
    """Campi comuni nel modello Trainer"""
    user_id: int = Field(..., description="Riferimento all'utente")
    bio: Optional[str] = Field(None, max_length=500, description="Biografia del trainer")
    hourly_rate: float = Field(..., gt=0, description="Tariffa oraria (> 0)")
    location: str = Field(..., min_length=1, max_length=100, description="Città/location")


class TrainerCreate(TrainerBase):
    """Schema per registrazione trainer (include lista specializzazioni)"""
    specialization_ids: List[int] = Field(default_factory=list, description="IDs specializzazioni")


class TrainerRead(TrainerBase):
    """Schema per lettura trainer (include oggetti specializzazioni)"""
    id: int = Field(..., description="ID univoco trainer")
    user: UserRead = Field(..., description="Dati utente associato")
    specializations: List[SpecializationRead] = Field(default_factory=list, description="Specializzazioni")
    created_at: datetime = Field(..., description="Data/ora creazione")

    class Config:
        from_attributes = True


class TrainerSearchResponse(BaseModel):
    """Schema per risposta di ricerca trainer (versione semplificata)"""
    id: int = Field(..., description="ID trainer")
    name: str = Field(..., description="Nome utente")
    location: str = Field(..., description="Location trainer")
    hourly_rate: float = Field(..., description="Tariffa oraria")
    bio: Optional[str] = Field(None, description="Biografia")
    specializations: List[str] = Field(default_factory=list, description="Nomi specializzazioni")

    class Config:
        from_attributes = True


# ============================================================================
# SESSION MODELS
# ============================================================================

class SessionBase(BaseModel):
    """Campi comuni nel modello Session"""
    date: str = Field(..., description="Data sessione (formato YYYY-MM-DD)")
    time: str = Field(..., description="Ora sessione (formato HH:MM)")
    status: SessionStatus = Field(default=SessionStatus.SCHEDULED, description="Stato sessione")
    trainer_id: int = Field(..., description="ID trainer")
    user_id: int = Field(..., description="ID client che prenota")


class SessionCreate(SessionBase):
    """Schema per creazione sessione"""
    pass


class SessionRead(SessionBase):
    """Schema per lettura sessione"""
    id: int = Field(..., description="ID univoco sessione")
    created_at: datetime = Field(..., description="Data/ora creazione prenotazione")
    trainer: Optional[TrainerRead] = Field(None, description="Dati trainer")
    user: Optional[UserRead] = Field(None, description="Dati client")

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    """Schema per aggiornamento sessione (solo status)"""
    status: SessionStatus = Field(..., description="Nuovo status sessione")
