"""
FitConnect - Schemi Pydantic per validazione dati
Compito 1B: Definizione completa di tutti i modelli dati
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date as DateType, time as TimeType
from enum import Enum


# ============================================================================
# ENUMERAZIONI
# ============================================================================

class UserRole(str, Enum):
    """Ruoli degli utenti nel sistema"""
    ADMIN = "admin"
    TRAINER = "trainer"
    CLIENT = "client"


class FitnessLevel(str, Enum):
    """Livelli di fitness per i clienti"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


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
    role: UserRole = Field(..., description="Ruolo: admin, trainer o client")


class UserCreate(UserBase):
    """Schema per creazione utente (include password)"""
    password: str = Field(..., min_length=6, description="Password (min 6 caratteri)")


class UserRead(UserBase):
    """Schema per lettura utente (esclude password)"""
    id: int = Field(..., description="ID univoco utente")
    is_active: bool = Field(..., description="Utente attivo")
    is_admin: bool = Field(..., description="Flag amministratore")
    created_at: datetime = Field(..., description="Data/ora creazione")

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    """Schema per attivazione/disattivazione utente"""
    is_active: bool = Field(..., description="Stato attivo utente")


# ============================================================================
# CLIENT MODELS
# ============================================================================

class ClientBase(BaseModel):
    """Campi comuni nel modello Client"""
    user_id: int = Field(..., description="Riferimento all'utente")
    phone: Optional[str] = Field(None, max_length=20, description="Numero telefono")
    birth_date: Optional[str] = Field(None, description="Data di nascita (YYYY-MM-DD)")
    fitness_level: FitnessLevel = Field(..., description="Livello fitness")


class ClientCreate(ClientBase):
    """Schema per creazione client"""
    pass


class ClientRead(ClientBase):
    """Schema per lettura client"""
    id: int = Field(..., description="ID univoco client")
    user: UserRead = Field(..., description="Dati utente associato")
    created_at: datetime = Field(..., description="Data/ora creazione")

    class Config:
        from_attributes = True


# ============================================================================
# SPECIALIZATION MODELS
# ============================================================================

class SpecializationBase(BaseModel):
    """Campi comuni nel modello Specialization"""
    name: str = Field(..., min_length=1, max_length=50, description="Nome specializzazione")
    description: Optional[str] = Field(None, max_length=255, description="Descrizione breve")
    icon: Optional[str] = Field(None, max_length=50, description="Icona opzionale")


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
    experience_years: int = Field(..., ge=0, description="Anni di esperienza (>= 0)")
    languages: Optional[str] = Field(None, description="Lingue parlate (es: Italiano,Inglese,Spagnolo)")
    session_types: Optional[str] = Field(None, description="Tipo sessioni (es: online,in_person)")
    lesson_types: Optional[str] = Field(None, description="Lezioni offerte (es: Cardio,Forza,Stretching)")


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
    experience_years: int = Field(..., description="Anni di esperienza")
    bio: Optional[str] = Field(None, description="Biografia")
    languages: Optional[str] = Field(None, description="Lingue parlate")
    session_types: Optional[str] = Field(None, description="Tipo sessioni")
    lesson_types: Optional[str] = Field(None, description="Lezioni offerte")
    specializations: List[str] = Field(default_factory=list, description="Nomi specializzazioni")

    class Config:
        from_attributes = True


# ============================================================================
# SESSION MODELS (⭐ Contiene le relazioni N:1 richieste)
# ============================================================================

class SessionBase(BaseModel):
    """Campi comuni nel modello Session
    
    ⭐ RELAZIONE N:1:
    - Molte sessioni (N) appartengono a UN cliente (1)
    - Molte sessioni (N) appartengono a UN trainer (1)
    """
    date: DateType = Field(..., description="Data sessione")
    time: TimeType = Field(..., description="Ora sessione")
    status: SessionStatus = Field(default=SessionStatus.SCHEDULED, description="Stato sessione")
    trainer_id: int = Field(..., description="ID trainer (relazione N:1)")
    client_id: int = Field(..., description="ID client che prenota (relazione N:1)")
    notes: Optional[str] = Field(None, max_length=1000, description="Note opzionali")


class SessionCreate(SessionBase):
    """Schema per creazione sessione"""
    pass


class SessionRead(SessionBase):
    """Schema per lettura sessione"""
    id: int = Field(..., description="ID univoco sessione")
    created_at: datetime = Field(..., description="Data/ora creazione prenotazione")
    trainer: Optional[TrainerRead] = Field(None, description="Dati trainer")
    client: Optional[ClientRead] = Field(None, description="Dati client")

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    """Schema per aggiornamento sessione (solo status)"""
    status: SessionStatus = Field(..., description="Nuovo status sessione")


# ============================================================================
# AUTHENTICATION & TOKEN MODELS
# ============================================================================

class Token(BaseModel):
    """Schema per risposta JWT token"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Tipo token (sempre 'bearer')")
    user: UserRead = Field(..., description="Dati utente autenticato")


class TokenData(BaseModel):
    """Schema per dati nel payload JWT"""
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# ============================================================================
# CONTACT MODELS (Form contatti pubblico)
# ============================================================================

class ContactBase(BaseModel):
    """Campi comuni nel modello Contact"""
    name: str = Field(..., min_length=1, max_length=100, description="Nome")
    email: EmailStr = Field(..., description="Email")
    phone: Optional[str] = Field(None, max_length=20, description="Telefono (opzionale)")
    subject: str = Field(..., min_length=1, max_length=255, description="Oggetto")
    message: str = Field(..., min_length=1, description="Messaggio")


class ContactCreate(ContactBase):
    """Schema per creazione messaggio contatto"""
    pass


class ContactRead(ContactBase):
    """Schema per lettura messaggio contatto"""
    id: int
    is_read: bool = Field(default=False, description="Messaggio letto")
    is_replied: bool = Field(default=False, description="Risposta inviata")
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# GROUP & PERMISSION MODELS (RBAC)
# ============================================================================

class PermissionBase(BaseModel):
    """Campi comuni nel modello Permission"""
    name: str = Field(..., max_length=100, description="Nome permesso")
    description: Optional[str] = Field(None, description="Descrizione permesso")


class PermissionRead(PermissionBase):
    """Schema per lettura permesso"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class GroupBase(BaseModel):
    """Campi comuni nel modello Group"""
    name: str = Field(..., max_length=100, description="Nome gruppo")
    description: Optional[str] = Field(None, description="Descrizione gruppo")


class GroupCreate(GroupBase):
    """Schema per creazione gruppo"""
    pass


class GroupRead(GroupBase):
    """Schema per lettura gruppo"""
    id: int
    created_at: datetime
    permissions: List[PermissionRead] = Field(default_factory=list, description="Permessi del gruppo")

    class Config:
        from_attributes = True


# ============================================================================
# CHAT MODELS
# ============================================================================

class ChatMessageCreate(BaseModel):
    """Schema invio messaggio chat"""
    message: str = Field(..., min_length=1, max_length=2000, description="Testo del messaggio")
    client_id: Optional[int] = Field(None, description="ID client (richiesto per trainer/admin)")


class ChatMessageRead(BaseModel):
    """Schema lettura messaggio chat"""
    id: int
    trainer_id: int
    client_id: int
    sender_user_id: int
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class TrainerChatConversationRead(BaseModel):
    """Riepilogo conversazione privata trainer <-> client"""
    client_id: int
    client_user_id: int
    client_name: str
    last_message: str
    last_message_at: datetime
    total_messages: int
