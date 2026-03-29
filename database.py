# FitConnect - Database Configuration
# SQLAlchemy + PostgreSQL/SQLite

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - usa SQLite per development, PostgreSQL per production
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./fitconnect.db"  # Default: SQLite locale
)

# Crea engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=True  # Log SQL queries (disabilita in production)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class per i modelli
Base = declarative_base()

# Dependency per ottenere DB session
def get_db():
    """
    Dependency che fornisce una sessione database.
    Usare con FastAPI Depends().
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funzione per inizializzare il database
def init_db():
    """
    Crea tutte le tabelle nel database.
    Da chiamare all'avvio dell'applicazione.
    """
    from models import User, Client, Trainer, Specialization, Session, TrainerSpecialization, Group, Permission
    Base.metadata.create_all(bind=engine)
    print("✅ Database inizializzato con successo!")

# Funzione per creare dati di esempio
def create_sample_data():
    """
    Popola il database con dati di esempio per testing.
    """
    from models import User, Trainer, Specialization, Group, Permission
    from auth import get_password_hash
    
    db = SessionLocal()
    
    try:
        # Verifica se ci sono già dati
        if db.query(User).first():
            print("⚠️  Database già popolato. Skip.")
            return
        
        # 1. Crea Gruppi e Permessi
        admin_group = Group(
            name="Administrators",
            description="Amministratori con accesso completo"
        )
        trainer_group = Group(
            name="Trainers",
            description="Personal trainer della piattaforma"
        )
        client_group = Group(
            name="Clients",
            description="Clienti che prenotano sessioni"
        )
        
        db.add_all([admin_group, trainer_group, client_group])
        db.commit()
        
        # 2. Crea Permessi
        permissions = [
            Permission(name="view_dashboard", description="Visualizza dashboard admin"),
            Permission(name="manage_users", description="Gestisce utenti"),
            Permission(name="manage_trainers", description="Gestisce trainer"),
            Permission(name="manage_clients", description="Gestisce clienti"),
            Permission(name="manage_sessions", description="Gestisce sessioni"),
            Permission(name="view_reports", description="Visualizza report"),
        ]
        db.add_all(permissions)
        db.commit()
        
        # Assegna permessi agli admin
        for perm in permissions:
            admin_group.permissions.append(perm)
        
        # Trainer hanno permessi limitati
        trainer_perms = ["manage_sessions", "view_reports"]
        for perm in permissions:
            if perm.name in trainer_perms:
                trainer_group.permissions.append(perm)
        
        db.commit()
        
        # 3. Crea Specializzazioni
        specializations = [
            Specialization(name="Powerlifting", description="Allenamento forza massimale"),
            Specialization(name="CrossFit", description="Functional fitness ad alta intensità"),
            Specialization(name="Yoga", description="Flessibilità e mindfulness"),
            Specialization(name="Pilates", description="Core strengthening"),
            Specialization(name="Cardio", description="Resistenza cardiovascolare"),
            Specialization(name="Bodybuilding", description="Ipertrofia muscolare"),
        ]
        db.add_all(specializations)
        db.commit()
        
        # 4. Crea Utente Admin
        admin_user = User(
            email="admin@fitconnect.com",
            name="Admin FitConnect",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_active=True,
            is_admin=True
        )
        admin_user.groups.append(admin_group)
        db.add(admin_user)
        
        # 5. Crea Utenti Trainer di esempio
        trainer_user1 = User(
            email="marco.trainer@fitconnect.com",
            name="Marco Bianchi",
            password_hash=get_password_hash("trainer123"),
            role="trainer",
            is_active=True
        )
        trainer_user1.groups.append(trainer_group)
        
        trainer_user2 = User(
            email="anna.trainer@fitconnect.com",
            name="Anna Verdi",
            password_hash=get_password_hash("trainer123"),
            role="trainer",
            is_active=True
        )
        trainer_user2.groups.append(trainer_group)
        
        db.add_all([trainer_user1, trainer_user2])
        db.commit()
        
        # 6. Crea Profili Trainer con i nuovi dettagli
        trainer1 = Trainer(
            user_id=trainer_user1.id,
            bio="Trainer esperto in powerlifting con 8 anni di esperienza. Specializzato nell'allenamento della forza e nella tecnica dei sollevamenti olimpici.",
            hourly_rate=50.0,
            location="Torino",
            experience_years=8,
            certification="CONI - Personal Trainer Powerlifting",
            is_verified=True,
            rating=4.8,
            total_sessions=156,
            languages="Italiano,Inglese",
            session_types="in_person,online",
            lesson_types="Powerlifting,Forza,Tecnica Olimpica"
        )
        trainer1.specializations = [specializations[0], specializations[4]]  # Powerlifting, Cardio
        
        trainer2 = Trainer(
            user_id=trainer_user2.id,
            bio="Istruttrice di Yoga e Pilates con formazione internazionale. Offro percorsi personalizzati per flessibilità, equilibrio e benessere mentale.",
            hourly_rate=45.0,
            location="Moncalieri",
            experience_years=6,
            certification="Yoga Alliance RYT-200",
            is_verified=True,
            rating=4.9,
            total_sessions=203,
            languages="Italiano,Inglese,Francese",
            session_types="in_person,online",
            lesson_types="Yoga,Pilates,Stretching,Meditazione"
        )
        trainer2.specializations = [specializations[2], specializations[3]]  # Yoga, Pilates
        
        db.add_all([trainer1, trainer2])
        
        # 7. Crea Utenti Client di esempio
        client_users = [
            User(
                email="luca.client@fitconnect.com",
                name="Luca Rossi",
                password_hash=get_password_hash("client123"),
                role="client",
                is_active=True
            ),
            User(
                email="maria.client@fitconnect.com",
                name="Maria Ferrari",
                password_hash=get_password_hash("client123"),
                role="client",
                is_active=True
            ),
        ]
        for user in client_users:
            user.groups.append(client_group)
            db.add(user)
        
        db.commit()
        
        print("✅ Dati di esempio creati:")
        print("   - Admin: admin@fitconnect.com / admin123")
        print("   - Trainer: marco.trainer@fitconnect.com / trainer123")
        print("   - Trainer: anna.trainer@fitconnect.com / trainer123")
        print("   - Client: luca.client@fitconnect.com / client123")
        print("   - 6 Specializzazioni")
        print("   - 3 Gruppi con permessi")
        print("   - 2 Profili Trainer con dettagli")
        
    except Exception as e:
        print(f"❌ Errore durante la creazione dei dati: {e}")
        db.rollback()
    finally:
        db.close()
