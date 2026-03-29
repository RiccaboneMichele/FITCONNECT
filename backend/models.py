# FitConnect - SQLAlchemy Models (ORM)
# Modelli database con relazioni complete

from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, Boolean, Text, Table, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# ============================================================================
# ENUMERAZIONI
# ============================================================================

class UserRoleEnum(str, enum.Enum):
    ADMIN = "admin"
    TRAINER = "trainer"
    CLIENT = "client"

class FitnessLevelEnum(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class SessionStatusEnum(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# ============================================================================
# TABELLE DI ASSOCIAZIONE (Many-to-Many)
# ============================================================================

# Tabella ponte: Trainer <-> Specialization
trainer_specialization = Table(
    'trainer_specialization',
    Base.metadata,
    Column('trainer_id', Integer, ForeignKey('trainers.id', ondelete='CASCADE'), primary_key=True),
    Column('specialization_id', Integer, ForeignKey('specializations.id', ondelete='CASCADE'), primary_key=True)
)

# Tabella ponte: Group <-> Permission
group_permission = Table(
    'group_permission',
    Base.metadata,
    Column('group_id', Integer, ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete='CASCADE'), primary_key=True)
)

# Tabella ponte: User <-> Group
user_group = Table(
    'user_group',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id', ondelete='CASCADE'), primary_key=True)
)

# ============================================================================
# MODELLI PRINCIPALI
# ============================================================================

class User(Base):
    """Modello User - Autenticazione e profilo base"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRoleEnum), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relazioni
    client_profile = relationship("Client", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    groups = relationship("Group", secondary=user_group, back_populates="users")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class Client(Base):
    """Modello Client - Profilo cliente"""
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=True)
    fitness_level = Column(SQLEnum(FitnessLevelEnum), nullable=False)
    address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    user = relationship("User", back_populates="client_profile")
    sessions = relationship("Session", back_populates="client", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="client", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Client(id={self.id}, user_id={self.user_id}, fitness_level={self.fitness_level})>"


class Trainer(Base):
    """Modello Trainer - Profilo trainer professionale"""
    __tablename__ = "trainers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    location = Column(String(100), nullable=False, index=True)
    experience_years = Column(Integer, nullable=False, default=0)
    certification = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    rating = Column(Float, default=0.0)
    total_sessions = Column(Integer, default=0)
    languages = Column(String(500), nullable=True)  # Es: "Italiano,Inglese,Spagnolo"
    session_types = Column(String(100), nullable=True)  # Es: "online,in_person"
    lesson_types = Column(Text, nullable=True)  # Es: "Cardio,Forza,Stretching,Pilates"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    user = relationship("User", back_populates="trainer_profile")
    specializations = relationship("Specialization", secondary=trainer_specialization, back_populates="trainers")
    sessions = relationship("Session", back_populates="trainer", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="trainer", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Trainer(id={self.id}, user_id={self.user_id}, location={self.location})>"


class Specialization(Base):
    """Modello Specialization - Specializzazioni fitness"""
    __tablename__ = "specializations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    trainers = relationship("Trainer", secondary=trainer_specialization, back_populates="specializations")
    
    def __repr__(self):
        return f"<Specialization(id={self.id}, name={self.name})>"


class Session(Base):
    """
    Modello Session - Sessioni di allenamento
    
    ⭐ RELAZIONI N:1:
    - Molte sessioni (N) → Un cliente (1)
    - Molte sessioni (N) → Un trainer (1)
    """
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True)
    trainer_id = Column(Integer, ForeignKey('trainers.id', ondelete='CASCADE'), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(SQLEnum(SessionStatusEnum), nullable=False, default=SessionStatusEnum.SCHEDULED, index=True)
    notes = Column(Text, nullable=True)
    client_notes = Column(Text, nullable=True)
    trainer_notes = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relazioni N:1
    client = relationship("Client", back_populates="sessions")
    trainer = relationship("Trainer", back_populates="sessions")
    
    def __repr__(self):
        return f"<Session(id={self.id}, date={self.date}, time={self.time}, status={self.status})>"


class ChatMessage(Base):
    """Messaggi chat tra client e trainer"""
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey('trainers.id', ondelete='CASCADE'), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey('clients.id', ondelete='CASCADE'), nullable=False, index=True)
    sender_user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    trainer = relationship("Trainer", back_populates="chat_messages")
    client = relationship("Client", back_populates="chat_messages")
    sender = relationship("User")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, trainer_id={self.trainer_id}, client_id={self.client_id})>"


# ============================================================================
# MODELLI PER PERMESSI E GRUPPI (RBAC - Role-Based Access Control)
# ============================================================================

class Group(Base):
    """Modello Group - Gruppi di utenti con permessi"""
    __tablename__ = "groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    users = relationship("User", secondary=user_group, back_populates="groups")
    permissions = relationship("Permission", secondary=group_permission, back_populates="groups")
    
    def __repr__(self):
        return f"<Group(id={self.id}, name={self.name})>"


class Permission(Base):
    """Modello Permission - Permessi specifici"""
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relazioni
    groups = relationship("Group", secondary=group_permission, back_populates="permissions")
    
    def __repr__(self):
        return f"<Permission(id={self.id}, name={self.name})>"


# ============================================================================
# MODELLI AGGIUNTIVI PER GESTIONE CONTATTI E DASHBOARD
# ============================================================================

class Contact(Base):
    """Modello Contact - Messaggi di contatto dal form"""
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    replied_at = Column(DateTime(timezone=True), nullable=True)
    replied_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Contact(id={self.id}, email={self.email}, subject={self.subject})>"


class AuditLog(Base):
    """Modello AuditLog - Log delle azioni degli utenti"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user_id={self.user_id})>"
