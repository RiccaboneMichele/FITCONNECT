# FitConnect - CRUD Operations
# Operazioni database per tutti i modelli

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import date, time, datetime
from models import (
    User, Client, Trainer, Specialization, Session as SessionModel,
    Group, Permission, Contact, AuditLog, ChatMessage,
    UserRoleEnum, FitnessLevelEnum, SessionStatusEnum
)
from schemas import (
    UserCreate, ClientCreate, TrainerCreate, SpecializationCreate,
    SessionCreate, ContactCreate, GroupCreate, ChatMessageCreate
)
from auth import get_password_hash
import models

# ============================================================================
# USER CRUD
# ============================================================================

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Ottiene un utente per ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Ottiene un utente per email"""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100, role: Optional[str] = None) -> List[User]:
    """Ottiene lista utenti con filtri opzionali"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    return query.offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Crea nuovo utente"""
    # Converti role a string se è un enum
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
    
    db_user = User(
        email=user.email,
        name=user.name,
        password_hash=get_password_hash(user.password),
        role=role_str,
        is_active=True,
        is_admin=role_str == "admin"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Assegna al gruppo appropriato
    if role_str == "admin":
        admin_group = db.query(Group).filter(Group.name == "Administrators").first()
        if admin_group:
            db_user.groups.append(admin_group)
    elif role_str == "trainer":
        trainer_group = db.query(Group).filter(Group.name == "Trainers").first()
        if trainer_group:
            db_user.groups.append(trainer_group)
    elif role_str == "client":
        client_group = db.query(Group).filter(Group.name == "Clients").first()
        if client_group:
            db_user.groups.append(client_group)
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

def update_user(db: Session, user_id: int, user_data: dict) -> Optional[User]:
    """Aggiorna utente"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    for key, value in user_data.items():
        if hasattr(db_user, key) and value is not None:
            if key == "password":
                db_user.password_hash = get_password_hash(value)
            elif key == "role":
                role_str = value.value if hasattr(value, 'value') else str(value)
                db_user.role = role_str
                db_user.is_admin = role_str == "admin"
            else:
                setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """Elimina utente"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True

# ============================================================================
# CLIENT CRUD
# ============================================================================

def get_client(db: Session, client_id: int) -> Optional[Client]:
    """Ottiene un client per ID"""
    return db.query(Client).options(joinedload(Client.user)).filter(Client.id == client_id).first()

def get_client_by_user_id(db: Session, user_id: int) -> Optional[Client]:
    """Ottiene un client per user_id"""
    return db.query(Client).filter(Client.user_id == user_id).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100) -> List[Client]:
    """Ottiene lista clienti"""
    return db.query(Client).options(joinedload(Client.user)).offset(skip).limit(limit).all()

def create_client(db: Session, client: ClientCreate, user_id: int) -> Client:
    """Crea nuovo client"""
    db_client = Client(
        user_id=user_id,
        phone=client.phone,
        birth_date=client.birth_date,
        fitness_level=client.fitness_level,
        address=client.address if hasattr(client, 'address') else None,
        notes=client.notes if hasattr(client, 'notes') else None
    )
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_data: dict) -> Optional[Client]:
    """Aggiorna client"""
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    
    for key, value in client_data.items():
        if hasattr(db_client, key) and value is not None:
            setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int) -> bool:
    """Elimina client"""
    db_client = get_client(db, client_id)
    if not db_client:
        return False
    
    db.delete(db_client)
    db.commit()
    return True

# ============================================================================
# TRAINER CRUD
# ============================================================================

def get_trainer(db: Session, trainer_id: int) -> Optional[Trainer]:
    """Ottiene un trainer per ID"""
    return db.query(Trainer).options(
        joinedload(Trainer.user),
        joinedload(Trainer.specializations)
    ).filter(Trainer.id == trainer_id).first()

def get_trainer_by_user_id(db: Session, user_id: int) -> Optional[Trainer]:
    """Ottiene un trainer per user_id"""
    return db.query(Trainer).filter(Trainer.user_id == user_id).first()

def get_trainers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    location: Optional[str] = None,
    specialization: Optional[str] = None,
    max_price: Optional[float] = None
) -> List[Trainer]:
    """Ottiene lista trainer con filtri opzionali"""
    query = db.query(Trainer).options(
        joinedload(Trainer.user),
        joinedload(Trainer.specializations)
    )
    
    if location:
        query = query.filter(Trainer.location.ilike(f"%{location}%"))
    
    if specialization:
        query = query.join(Trainer.specializations).filter(
            Specialization.name.ilike(f"%{specialization}%")
        )
    
    if max_price:
        query = query.filter(Trainer.hourly_rate <= max_price)
    
    return query.offset(skip).limit(limit).all()

def create_trainer(db: Session, trainer: TrainerCreate, user_id: int) -> Trainer:
    """Crea nuovo trainer"""
    db_trainer = Trainer(
        user_id=user_id,
        bio=trainer.bio,
        hourly_rate=trainer.hourly_rate,
        location=trainer.location,
        experience_years=trainer.experience_years,
        certification=trainer.certification if hasattr(trainer, 'certification') else None,
        is_verified=False,
        rating=0.0,
        total_sessions=0
    )
    
    # Aggiungi specializzazioni
    if hasattr(trainer, 'specialization_ids') and trainer.specialization_ids:
        for spec_id in trainer.specialization_ids:
            spec = db.query(Specialization).filter(Specialization.id == spec_id).first()
            if spec:
                db_trainer.specializations.append(spec)
    
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer

def update_trainer(db: Session, trainer_id: int, trainer_data: dict) -> Optional[Trainer]:
    """Aggiorna trainer"""
    db_trainer = get_trainer(db, trainer_id)
    if not db_trainer:
        return None
    
    # Gestione specializzazioni
    if 'specialization_ids' in trainer_data:
        spec_ids = trainer_data.pop('specialization_ids')
        db_trainer.specializations.clear()
        for spec_id in spec_ids:
            spec = db.query(Specialization).filter(Specialization.id == spec_id).first()
            if spec:
                db_trainer.specializations.append(spec)
    
    # Aggiorna altri campi
    for key, value in trainer_data.items():
        if hasattr(db_trainer, key) and value is not None:
            setattr(db_trainer, key, value)
    
    db.commit()
    db.refresh(db_trainer)
    return db_trainer

# ============================================================================
# SESSION CRUD
# ============================================================================

def get_session(db: Session, session_id: int) -> Optional[SessionModel]:
    """Ottiene una sessione per ID"""
    return db.query(SessionModel).options(
        joinedload(SessionModel.client).joinedload(Client.user),
        joinedload(SessionModel.trainer).joinedload(Trainer.user)
    ).filter(SessionModel.id == session_id).first()

def get_sessions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = None,
    trainer_id: Optional[int] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[SessionModel]:
    """Ottiene lista sessioni con filtri"""
    query = db.query(SessionModel).options(
        joinedload(SessionModel.client).joinedload(Client.user),
        joinedload(SessionModel.trainer).joinedload(Trainer.user)
    )
    
    if client_id:
        query = query.filter(SessionModel.client_id == client_id)
    
    if trainer_id:
        query = query.filter(SessionModel.trainer_id == trainer_id)
    
    if status:
        query = query.filter(SessionModel.status == status)
    
    if date_from:
        query = query.filter(SessionModel.date >= date_from)
    
    if date_to:
        query = query.filter(SessionModel.date <= date_to)
    
    return query.order_by(SessionModel.date, SessionModel.time).offset(skip).limit(limit).all()

def create_session(db: Session, session: SessionCreate) -> Optional[SessionModel]:
    """Crea nuova sessione con validazione conflitti"""
    session_date = session.date if isinstance(session.date, date) else date.fromisoformat(str(session.date))
    session_time = session.time if isinstance(session.time, time) else time.fromisoformat(str(session.time))

    # Verifica che il trainer sia disponibile
    conflict = db.query(SessionModel).filter(
        and_(
            SessionModel.trainer_id == session.trainer_id,
            SessionModel.date == session_date,
            SessionModel.time == session_time,
            SessionModel.status != SessionStatusEnum.CANCELLED
        )
    ).first()
    
    if conflict:
        return None  # Conflitto: trainer già impegnato
    
    # Ottieni prezzo dal trainer
    trainer = db.query(Trainer).filter(Trainer.id == session.trainer_id).first()
    price = trainer.hourly_rate if trainer else None
    
    db_session = SessionModel(
        client_id=session.client_id,
        trainer_id=session.trainer_id,
        date=session_date,
        time=session_time,
        duration_minutes=session.duration_minutes if hasattr(session, 'duration_minutes') else 60,
        status=SessionStatusEnum.SCHEDULED,
        notes=session.notes if hasattr(session, 'notes') else None,
        price=price
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Incrementa contatore sessioni trainer
    if trainer:
        trainer.total_sessions += 1
        db.commit()
    
    return db_session

def update_session(db: Session, session_id: int, session_data: dict) -> Optional[SessionModel]:
    """Aggiorna sessione"""
    db_session = get_session(db, session_id)
    if not db_session:
        return None
    
    for key, value in session_data.items():
        if hasattr(db_session, key) and value is not None:
            setattr(db_session, key, value)
    
    db.commit()
    db.refresh(db_session)
    return db_session

def cancel_session(db: Session, session_id: int) -> Optional[SessionModel]:
    """Cancella sessione"""
    return update_session(db, session_id, {"status": SessionStatusEnum.CANCELLED})

# ============================================================================
# SPECIALIZATION CRUD
# ============================================================================

def get_specializations(db: Session) -> List[Specialization]:
    """Ottiene tutte le specializzazioni"""
    return db.query(Specialization).all()

def create_specialization(db: Session, spec: SpecializationCreate) -> Specialization:
    """Crea nuova specializzazione"""
    db_spec = Specialization(
        name=spec.name,
        description=spec.description,
        icon=spec.icon if hasattr(spec, 'icon') else None
    )
    
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec

# ============================================================================
# GROUP & PERMISSION CRUD
# ============================================================================

def get_groups(db: Session) -> List[Group]:
    """Ottiene tutti i gruppi"""
    return db.query(Group).options(joinedload(Group.permissions)).all()

def create_group(db: Session, group: GroupCreate) -> Group:
    """Crea nuovo gruppo"""
    db_group = Group(
        name=group.name,
        description=group.description if hasattr(group, 'description') else None
    )
    
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def add_permission_to_group(db: Session, group_id: int, permission_id: int) -> Optional[Group]:
    """Aggiunge permesso a gruppo"""
    group = db.query(Group).filter(Group.id == group_id).first()
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    
    if not group or not permission:
        return None
    
    if permission not in group.permissions:
        group.permissions.append(permission)
        db.commit()
        db.refresh(group)
    
    return group

# ============================================================================
# CONTACT CRUD
# ============================================================================

def get_contacts(db: Session, skip: int = 0, limit: int = 100, is_read: Optional[bool] = None) -> List[Contact]:
    """Ottiene messaggi di contatto"""
    query = db.query(Contact)
    
    if is_read is not None:
        query = query.filter(Contact.is_read == is_read)
    
    return query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()

def create_contact(db: Session, contact: ContactCreate) -> Contact:
    """Crea nuovo messaggio di contatto"""
    db_contact = Contact(
        name=contact.name,
        email=contact.email,
        phone=contact.phone if hasattr(contact, 'phone') else None,
        subject=contact.subject,
        message=contact.message,
        is_read=False,
        is_replied=False
    )
    
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def mark_contact_read(db: Session, contact_id: int) -> Optional[Contact]:
    """Marca messaggio come letto"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if contact:
        contact.is_read = True
        db.commit()
        db.refresh(contact)
    return contact

# ============================================================================
# AUDIT LOG
# ============================================================================

def create_audit_log(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Crea log di audit"""
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address
    )
    
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

# ============================================================================
# DASHBOARD STATISTICS
# ============================================================================

def get_dashboard_stats(db: Session) -> dict:
    """Ottiene statistiche per dashboard admin"""
    total_users = db.query(User).count()
    total_clients = db.query(Client).count()
    total_trainers = db.query(Trainer).count()


# ============================================================================
# CHAT CRUD
# ============================================================================

def get_chat_messages(
    db: Session,
    trainer_id: int,
    client_id: int,
    limit: int = 100
) -> List[ChatMessage]:
    """Restituisce i messaggi della chat tra un trainer e un client"""
    return db.query(ChatMessage).filter(
        ChatMessage.trainer_id == trainer_id,
        ChatMessage.client_id == client_id
    ).order_by(ChatMessage.created_at.asc()).limit(limit).all()


def create_chat_message(
    db: Session,
    trainer_id: int,
    client_id: int,
    sender_user_id: int,
    payload: ChatMessageCreate
) -> ChatMessage:
    """Crea un nuovo messaggio chat"""
    new_message = ChatMessage(
        trainer_id=trainer_id,
        client_id=client_id,
        sender_user_id=sender_user_id,
        message=payload.message.strip()
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


def get_trainer_chat_conversations(
    db: Session,
    trainer_id: int,
    limit: int = 50
) -> List[dict]:
    """Restituisce le conversazioni private del trainer aggregate per client."""
    messages = db.query(ChatMessage).options(
        joinedload(ChatMessage.client).joinedload(Client.user)
    ).filter(
        ChatMessage.trainer_id == trainer_id
    ).order_by(
        ChatMessage.created_at.desc()
    ).all()

    conversations_map = {}
    for msg in messages:
        if msg.client_id not in conversations_map:
            client_name = msg.client.user.name if msg.client and msg.client.user else f"Cliente {msg.client_id}"
            client_user_id = msg.client.user.id if msg.client and msg.client.user else 0
            conversations_map[msg.client_id] = {
                "client_id": msg.client_id,
                "client_user_id": client_user_id,
                "client_name": client_name,
                "last_message": msg.message,
                "last_message_at": msg.created_at,
                "total_messages": 1
            }
        else:
            conversations_map[msg.client_id]["total_messages"] += 1

    conversations = list(conversations_map.values())
    conversations.sort(key=lambda x: x["last_message_at"], reverse=True)
    return conversations[:limit]
    total_sessions = db.query(SessionModel).count()
    
    # Sessioni per status
    scheduled_sessions = db.query(SessionModel).filter(
        SessionModel.status == SessionStatusEnum.SCHEDULED
    ).count()
    
    completed_sessions = db.query(SessionModel).filter(
        SessionModel.status == SessionStatusEnum.COMPLETED
    ).count()
    
    cancelled_sessions = db.query(SessionModel).filter(
        SessionModel.status == SessionStatusEnum.CANCELLED
    ).count()
    
    # Messaggi non letti
    unread_contacts = db.query(Contact).filter(Contact.is_read == False).count()
    
    # Revenue totale (sessioni completate)
    total_revenue = db.query(func.sum(SessionModel.price)).filter(
        SessionModel.status == SessionStatusEnum.COMPLETED
    ).scalar() or 0.0
    
    return {
        "total_users": total_users,
        "total_clients": total_clients,
        "total_trainers": total_trainers,
        "total_sessions": total_sessions,
        "scheduled_sessions": scheduled_sessions,
        "completed_sessions": completed_sessions,
        "cancelled_sessions": cancelled_sessions,
        "unread_contacts": unread_contacts,
        "total_revenue": round(total_revenue, 2)
    }
