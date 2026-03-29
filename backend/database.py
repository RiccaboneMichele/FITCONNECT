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
   
    from models import User, Client, Trainer, Specialization, Session, Group, Permission, ChatMessage
    from sqlalchemy import inspect, text
    
    # Controlla se la tabella trainers esiste e se ha le nuove colonne
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if 'trainers' in tables:
        columns = [col['name'] for col in inspector.get_columns('trainers')]
        missing_columns = set(['languages', 'session_types', 'lesson_types']) - set(columns)
        
        if missing_columns:
            print(f"⚠️  Colonne mancanti in trainers: {missing_columns}")
            print("🔄 Ricreazione della tabella trainers...")
            
            try:
                # Drop della tabella trainers (con foreign key constraints)
                with engine.begin() as conn:
                    if 'sqlite' in DATABASE_URL:
                        conn.execute(text("PRAGMA foreign_keys=OFF"))
                        conn.execute(text("DROP TABLE IF EXISTS trainers"))
                        conn.execute(text("PRAGMA foreign_keys=ON"))
                    else:
                        conn.execute(text("DROP TABLE IF EXISTS trainers CASCADE"))
                
                print("✅ Tabella trainers eliminata")
            except Exception as e:
                print(f"⚠️  Errore nel drop: {e}, continuo comunque...")
    
    # Ricrea tutte le tabelle (solo quelle mancanti)
    Base.metadata.create_all(bind=engine)
    print("✅ Database inizializzato con successo!")

# Funzione per creare dati di esempio
def create_sample_data():
    """
    Popola il database con dati di esempio per testing.
    """
    from models import (
        User, Specialization, Group, Permission, UserRoleEnum,
        Trainer, Client, FitnessLevelEnum
    )
    from auth import get_password_hash
    
    db = SessionLocal()
    
    try:
        print("📦 Verifica e allineamento dati di esempio...")

        # 1) Gruppi (idempotente)
        group_specs = {
            "Administrators": "Amministratori con accesso completo",
            "Trainers": "Personal trainer della piattaforma",
            "Clients": "Clienti che prenotano sessioni",
        }
        groups = {}
        for name, description in group_specs.items():
            group = db.query(Group).filter(Group.name == name).first()
            if not group:
                group = Group(name=name, description=description)
                db.add(group)
                db.flush()
            groups[name] = group

        # 2) Permessi (idempotente)
        permission_specs = {
            "view_dashboard": "Visualizza dashboard admin",
            "manage_users": "Gestisce utenti",
            "manage_trainers": "Gestisce trainer",
            "manage_clients": "Gestisce clienti",
            "manage_sessions": "Gestisce sessioni",
            "view_reports": "Visualizza report",
        }
        permissions = {}
        for name, description in permission_specs.items():
            perm = db.query(Permission).filter(Permission.name == name).first()
            if not perm:
                perm = Permission(name=name, description=description)
                db.add(perm)
                db.flush()
            permissions[name] = perm

        admin_group = groups["Administrators"]
        trainer_group = groups["Trainers"]
        client_group = groups["Clients"]

        for perm in permissions.values():
            if perm not in admin_group.permissions:
                admin_group.permissions.append(perm)

        for name in ["manage_sessions", "view_reports"]:
            perm = permissions[name]
            if perm not in trainer_group.permissions:
                trainer_group.permissions.append(perm)

        # 3) Specializzazioni (idempotente)
        specialization_specs = [
            ("Powerlifting", "Allenamento forza massimale"),
            ("CrossFit", "Functional fitness ad alta intensità"),
            ("Yoga", "Flessibilità e mindfulness"),
            ("Pilates", "Core strengthening"),
            ("Cardio", "Resistenza cardiovascolare"),
            ("Bodybuilding", "Ipertrofia muscolare"),
            ("Nutrizione Sportiva", "Piani alimentari per obiettivi fitness"),
            ("Posturale", "Recupero mobilità e benessere posturale"),
            ("Functional Training", "Allenamenti multiarticolari funzionali"),
            ("Calisthenics", "Forza a corpo libero"),
        ]
        specs_by_name = {}
        for name, description in specialization_specs:
            spec = db.query(Specialization).filter(Specialization.name == name).first()
            if not spec:
                spec = Specialization(name=name, description=description)
                db.add(spec)
                db.flush()
            specs_by_name[name] = spec

        # 4) Utenti base (idempotente)
        users_seed = [
            ("admin@fitconnect.com", "Admin FitConnect", "admin123", UserRoleEnum.ADMIN, True, admin_group),
            ("marco.trainer@fitconnect.com", "Marco Bianchi", "trainer123", UserRoleEnum.TRAINER, False, trainer_group),
            ("anna.trainer@fitconnect.com", "Anna Verdi", "trainer123", UserRoleEnum.TRAINER, False, trainer_group),
            ("giulia.trainer@fitconnect.com", "Giulia Neri", "trainer123", UserRoleEnum.TRAINER, False, trainer_group),
            ("simone.trainer@fitconnect.com", "Simone Russo", "trainer123", UserRoleEnum.TRAINER, False, trainer_group),
            ("luca.client@fitconnect.com", "Luca Rossi", "client123", UserRoleEnum.CLIENT, False, client_group),
            ("maria.client@fitconnect.com", "Maria Ferrari", "client123", UserRoleEnum.CLIENT, False, client_group),
            ("sara.client@fitconnect.com", "Sara Conti", "client123", UserRoleEnum.CLIENT, False, client_group),
        ]

        users_by_email = {}
        for email, name, password, role, is_admin, group in users_seed:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    name=name,
                    password_hash=get_password_hash(password),
                    role=role,
                    is_active=True,
                    is_admin=is_admin,
                )
                db.add(user)
                db.flush()
            if group not in user.groups:
                user.groups.append(group)
            users_by_email[email] = user

        # 5) Profili trainer (idempotente)
        trainer_profiles = [
            {
                "email": "marco.trainer@fitconnect.com",
                "bio": "Specialista forza e ipertrofia con approccio progressivo.",
                "hourly_rate": 45.0,
                "location": "Moncalieri",
                "experience_years": 8,
                "certification": "NSCA-CPT",
                "specializations": ["Powerlifting", "Bodybuilding"],
                "languages": "Italiano,Inglese",
                "session_types": "in_person,online",
                "lesson_types": "Powerlifting,Bodybuilding,Forza,Ipertrofia",
            },
            {
                "email": "anna.trainer@fitconnect.com",
                "bio": "Allenamento funzionale e mobilità per benessere quotidiano.",
                "hourly_rate": 40.0,
                "location": "Torino",
                "experience_years": 6,
                "certification": "ISSA Fitness Trainer",
                "specializations": ["Yoga", "Pilates", "Posturale"],
                "languages": "Italiano,Inglese,Francese",
                "session_types": "in_person,online",
                "lesson_types": "Yoga,Pilates,Stretching,Meditazione",
            },
            {
                "email": "giulia.trainer@fitconnect.com",
                "bio": "Programmi cardio e dimagrimento con monitoraggio obiettivi.",
                "hourly_rate": 38.0,
                "location": "Moncalieri",
                "experience_years": 5,
                "certification": "CONI Personal Trainer",
                "specializations": ["Cardio", "Functional Training", "Nutrizione Sportiva"],
                "languages": "Italiano,Inglese",
                "session_types": "online",
                "lesson_types": "Cardio,HIIT,Spinning,Dimagrimento",
            },
            {
                "email": "simone.trainer@fitconnect.com",
                "bio": "Coach calisthenics orientato a tecnica, controllo e performance.",
                "hourly_rate": 42.0,
                "location": "Nichelino",
                "experience_years": 7,
                "certification": "FIF Street Workout",
                "specializations": ["Calisthenics", "CrossFit"],
                "languages": "Italiano,Inglese,Tedesco",
                "session_types": "in_person",
                "lesson_types": "Calisthenics,CrossFit,Ginnastica Artistica,Forza Funzionale",
            },
        ]

        for profile in trainer_profiles:
            user = users_by_email.get(profile["email"])
            if not user:
                continue

            trainer = db.query(Trainer).filter(Trainer.user_id == user.id).first()
            if not trainer:
                trainer = Trainer(
                    user_id=user.id,
                    bio=profile["bio"],
                    hourly_rate=profile["hourly_rate"],
                    location=profile["location"],
                    experience_years=profile["experience_years"],
                    certification=profile["certification"],
                    is_verified=True,
                    rating=4.7,
                    total_sessions=0,
                    languages=profile.get("languages"),
                    session_types=profile.get("session_types"),
                    lesson_types=profile.get("lesson_types"),
                )
                db.add(trainer)
                db.flush()
            else:
                if not trainer.location:
                    trainer.location = profile["location"]
                if not trainer.languages:
                    trainer.languages = profile.get("languages")
                if not trainer.session_types:
                    trainer.session_types = profile.get("session_types")
                if not trainer.lesson_types:
                    trainer.lesson_types = profile.get("lesson_types")

            for spec_name in profile["specializations"]:
                spec = specs_by_name.get(spec_name)
                if spec and spec not in trainer.specializations:
                    trainer.specializations.append(spec)

        # 6) Profili client (idempotente)
        client_profiles = [
            ("luca.client@fitconnect.com", FitnessLevelEnum.INTERMEDIATE, "Moncalieri"),
            ("maria.client@fitconnect.com", FitnessLevelEnum.BEGINNER, "Torino"),
            ("sara.client@fitconnect.com", FitnessLevelEnum.ADVANCED, "Moncalieri"),
        ]

        for email, level, address in client_profiles:
            user = users_by_email.get(email)
            if not user:
                continue
            existing_client = db.query(Client).filter(Client.user_id == user.id).first()
            if not existing_client:
                db.add(
                    Client(
                        user_id=user.id,
                        fitness_level=level,
                        address=address
                    )
                )

        db.commit()

        total_users = db.query(User).count()
        total_trainers = db.query(Trainer).count()
        total_specs = db.query(Specialization).count()

        print("✅ Dati di esempio allineati con successo!")
        print(f"   - Utenti: {total_users}")
        print(f"   - Trainer con profilo: {total_trainers}")
        print(f"   - Specializzazioni: {total_specs}")
        print("   - Credenziali demo: admin@fitconnect.com / admin123")
        print("   - Trainer demo: marco.trainer@fitconnect.com / trainer123")
        print("   - Client demo: luca.client@fitconnect.com / client123")
        
    except Exception as e:
        print(f"❌ Errore durante la creazione dei dati di esempio:")
        print(f"   {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise  # Rilancia l'errore per debugging
    finally:
        db.close()
