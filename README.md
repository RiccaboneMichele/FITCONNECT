# FitConnect - Progetto Dimostrativo FastAPI

> **La piattaforma che connette personal trainer e clienti fitness**
>
> Progetto universitario per la valutazione di: Analisi & Design, Schemi Pydantic, e Presentazione

---

## 📋 Sommario Esecutivo

FitConnect è una piattaforma digitale progettata per semplificare l'incontro tra personal trainer professionisti e clienti interessati a sessioni di allenamento personalizzate. Questo progetto è **DIMOSTRATIVO** - contiene una struttura API completa con dati fittizi, modelli Pydantic validati, e documentazione design-first, **senza database reale e senza ORM**.

---

## 🎯 Compito 1: Analisi & Design

### 1.1 Problem Statement

| Attore | Problema | Impatto |
|--------|----------|--------|
| **Personal Trainer** | Difficoltà da trovare clienti e gestire disponibilità | Perdita di opportunità di lavoro |
| **Clienti Fitness** | Incertezza su quale trainer scegliere | Navigazione confusa tra opzioni limitate |
| **Mercato** | Assenza di piattaforma dedicata | Manca ecosistema centralizzato fitness |

**Soluzione proposta**: Una piattaforma digitale che:
- ✅ Consente ai trainer di registrarsi con profilo professionale
- ✅ Permette ai clienti di cercare trainer per specializzazione e location
- ✅ Gestisce prenotazione sessioni con validazione conflitti orari

---

### 1.2 Target Audience

| Segmento | Descrizione | Motivazione |
|----------|-------------|------------|
| **Primary** | Personal trainer freelance (20-55 anni) | Cercano visibilità digitale e clienti |
| **Secondary** | Paesani fitness enthusiasts (18-45 anni) | Cercano sessioni personalizzate di qualità |
| **Tertiary** | Studio fitness piccoli/medi | Cercano piattaforma per gestire trainer |

**Geografico**: Primariamente Italia (Milano, Roma, altre città principali)

---

### 1.3 Requisiti Funzionali (MVP Phase 1)

| ID | Funzionalità | Descrizione | Priorità |
|----|------|-------------|----------|
| **RF1** | Registrazione Trainer | Trainer può registrarsi con anagrafica, bio, tariffa oraria, specializzazioni | 🔴 ALTA |
| **RF2** | Ricerca Trainer | Cliente può cercare trainer per location, specializzazione, tariffa massima | 🔴 ALTA |
| **RF3** | Prenotazione Sessioni | Cliente può prenotare sessione, sistema valida conflitti orari | 🔴 ALTA |
| **RF4** | Validazione Dati | Sistema valida email univoca, formati data/hora corretti | 🟡 MEDIA |
| **RF5** | Gestione Errori Robusta | API restituisce codici HTTP e messaggi espliciti | 🟡 MEDIA |

---

### 1.4 Requisiti Futuri (Phase 2-3)

| Feature | Descrizione | Timeline |
|---------|-------------|----------|
| **Rating & Review** | Clienti valutano sessioni (1-5 stelle), media rating visibile | Q2 2026 |
| **Payment Integration** | Pagamento via Stripe/PayPal, wallet sistema | Q2 2026 |

| **Email Notifications** | Notifiche cambio status e reminder sessioni | Q3 2026 |
| **Analytics** | Dashboard trainer con statistiche prenotazioni | Q3 2026 |
| **Mobile App** | App React Native per iOS/Android | Q3 2026 |

---

## 🎨 Compito 1B: Schemi Pydantic

### 2.1 Diagramma UML Testuale

```
┌──────────────────────────────────────────────────────────────────┐
│                        FitConnect - UML                          │
└──────────────────────────────────────────────────────────────────┘


                            ┌──────────────────┐
                            │       User       │
                            ├──────────────────┤
                            │ id: int (PK)     │
                            │ email: str (UQ)  │
                            │ name: str        │
                            │ role: enum       │
                            │ password: str    │
                            │ created_at: dt   │
                            └──────────────────┘
                                      △
                       N │ 1          │ 1          │ 1
                         │            │            │
         ┌───────────────┼────────────┼───────────┐
         │               │            │           │
         │               │            │           │
         ▼               ▼            │           ▼
    ┌─────────────┐ ┌──────────┐    │      ┌──────────┐
    │   Session   │ │ Trainer  │────┘      │ (can be) │
    ├─────────────┤ ├──────────┤           │  client  │
    │ id: int (PK)│ │ id: int  │           └──────────┘
    │ date: str   │ │ user_id  │
    │ time: str   │ │ (FK)User │
    │ status:enum │ │ bio: str │
    │ trainer: FK │ │ rate: flt│
    │ user: FK    │ │ location │
    │ created_at  │ │ created_at
    └─────────────┘ └──────────┘
         △               △
         │               │
         │            N  │  M
         │               │
         │    ┌──────────────────────────┐
         │    │ TRAINER_SPECIALIZATION   │
         │    │ (Association Table)      │
         │    ├──────────────────────────┤
         │    │ trainer_id (FK)          │
         │    │ specialization_id (FK)   │
         │    └──────────────────────────┘
         │
         │
    ┌────────────────────┐
    │ Specialization     │
    ├────────────────────┤
    │ id: int (PK)       │
    │ name: str (UQ)     │
    └────────────────────┘

LEGENDA:
- PK = Primary Key (chiave primaria)
- FK = Foreign Key (chiave esterna)
- UQ = Unique (univoco)
- dt = datetime
- flt = float
- enum = enumerazione (trainer/client, scheduled/completed/cancelled)

RELAZIONI:
1. User 1:N Trainer (un utente può essere 1 trainer)
2. User 1:N Session (un utente può prenotare N sessioni)
3. Trainer 1:N Session (un trainer ha N sessioni prenotate)
4. Trainer N:M Specialization (trainer ha N specializzazioni)
```

---

### 2.2 Schemi Pydantic

Tutti gli schemi sono definiti in [schemas.py](schemas.py) seguendo il pattern:

Per **OGNI entità** (User, Trainer, Specialization, Session):
- **Base**: Campi comuni
- **Create**: Base + campi per creazione (es. password, foreign keys come liste)
- **Read**: Base + ID + timestamp (es. created_at)

#### User

```python
class UserBase(BaseModel):
    email: EmailStr  # Email validata Pydantic
    name: str        # 1-100 caratteri
    role: UserRole   # enum: trainer | client

class UserCreate(UserBase):
    password: str    # Min 6 caratteri

class UserRead(UserBase):
    id: int          # Aggiunto solo in Read
    created_at: datetime
```

#### Trainer

```python
class TrainerBase(BaseModel):
    user_id: int           # Foreign Key
    bio: Optional[str]     # Biografia opzionale
    hourly_rate: float     # > 0
    location: str

class TrainerCreate(TrainerBase):
    specialization_ids: List[int]  # Lista IDs per relazione N:M

class TrainerRead(TrainerBase):
    id: int
    user: UserRead         # Nested object, non just ID
    specializations: List[SpecializationRead]
    created_at: datetime
```

#### Specialization

```python
class SpecializationBase(BaseModel):
    name: str              # Unico

class SpecializationCreate(SpecializationBase):
    pass

class SpecializationRead(SpecializationBase):
    id: int
```

#### Session

```python
class SessionBase(BaseModel):
    date: str              # YYYY-MM-DD
    time: str              # HH:MM
    status: SessionStatus  # scheduled | completed | cancelled
    trainer_id: int        # FK
    user_id: int           # FK

class SessionCreate(SessionBase):
    pass

class SessionRead(SessionBase):
    id: int
    trainer: Optional[TrainerRead]    # Nested
    user: Optional[UserRead]          # Nested
    created_at: datetime

class SessionUpdate(BaseModel):
    status: SessionStatus  # Solo per PATCH
```
