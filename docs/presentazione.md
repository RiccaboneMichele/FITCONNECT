# FitConnect - Slide Presentazione

Documento di supporto per presentazione orale (5-6 minuti)

---

## SLIDE 1: Concept & Problem Statement

**Titolo**: FitConnect - La piattaforma per il matching trainer-cliente

### Problema
- ❌ **Per i trainer**: Difficile trovare clienti, gestire disponibilità
- ❌ **Per i clienti**: Incertezza nella scelta del trainer giusto
- ❌ **Per il mercato**: Assenza di piattaforma centralizzata

### Soluzione
✅ Una **piattaforma digitale** che:
- Permette ai trainer di registrarsi con profilo professionale
- Consente ai clienti di cercare trainer per location e specializzazione
- Gestisce prenotazione sessioni con validazione conflitti

### Target
- 🏋️ Personal trainer freelance (Primary)
- 💪 Fitness enthusiasts (Secondary)
- 🏢 Piccoli/medi studio fitness (Tertiary)

---

## SLIDE 2: MVP - Minimal Viable Product

### 3 Core Features

#### 1️⃣ Registrazione Trainer
```
POST /api/trainers/register
```
- Trainer fornisce: anagrafica, bio, tariffa oraria, specializzazioni
- Sistema salva profilo e crea profilo ricercabile

#### 2️⃣ Ricerca Trainer (Filtri Avanzati)
```
GET /api/trainers/search?location=Milano&max_rate=50.0&specialization=Yoga
```
- Clienti cercano trainer con parametri opzionali
- Risultati filtrati per location, specializzazione, tariffa massima

#### 3️⃣ Prenotazione Sessioni
```
POST /api/sessions
```
- Client prenota sessione con trainer
- Sistema valida: data/ora valide, non conflitto orario
- Sessione creata con status "scheduled"

### Roadmap
| Phase | Timeline | Contenuto |
|-------|----------|-----------|
| **MVP** | Ora | Registrazione, Ricerca, Prenotazione |
| **Phase 2** | Q2 2026 | Rating & Review, Pagamenti |
| **Phase 3** | Q3 2026 | Mobile App, Analytics, Subscriptions |

---

## SLIDE 3: Architettura & Modelli Dati

### Diagramma UML (Semplificato)

```
USER (1)
  │ 1:N
  ├── TRAINER (1) ─────────┐
  │                        │ 1:N
  │                        │
  │   ┌─────────────────────┴──────SPECIALIZATION (N)
  │   │ N:M
  │   │
  └─────SESSION
       └─ trainer_id (FK)
       └─ user_id (FK)
```

### 4 Entità Core

| Entità | Campi Chiave | Relazioni |
|--------|-------------|-----------|
| **User** | email (UQ), name, role, password | 1 Trainer, N Session |
| **Trainer** | user_id (FK), hourly_rate, location, bio | 1 User, N Session, N:M Specialization |
| **Specialization** | name (UQ) | N:M with Trainer |
| **Session** | date, time, status, trainer_id (FK), user_id (FK) | N:1 Trainer, N:1 User |

### Validazioni Importanti
- ✅ Email univoca per User
- ✅ hourly_rate > 0
- ✅ date formato YYYY-MM-DD, time formato HH:MM
- ✅ Nessun conflitto: (date + time + trainer_id) unico per status != cancelled

---

## SLIDE 4: Schemi Pydantic (Compito 1B)

### Pattern Base-Create-Read

Per **OGNI entità**:

```python
# BASE: Campi comuni
class EntityBase(BaseModel):
    field1: str
    field2: int

# CREATE: Base + campi per creazione
class EntityCreate(EntityBase):
    password: str  # (solo se necessario)
    relation_ids: List[int]  # (relazioni N:M)

# READ: Base + ID + timestamp
class EntityRead(EntityBase):
    id: int
    related_objects: List[RelatedRead]  # (nested)
    created_at: datetime
```

### Esempio: Trainer

```python
class TrainerCreate(BaseModel):
    user_id: int
    bio: Optional[str]
    hourly_rate: float
    location: str
    specialization_ids: List[int]  # ← N:M come Liste IDs

class TrainerRead(BaseModel):
    id: int
    user: UserRead  # ← Nested object
    hourly_rate: float
    specializations: List[SpecializationRead]  # ← Come oggetti
    created_at: datetime
```

### Validazioni Pydantic
- ✅ EmailStr per email univoche
- ✅ Field constraints (min_length, gt=0, etc.)
- ✅ Optional per campi nullable
- ✅ Enumerazioni per status/role
- ✅ from_attributes=True per ORM compatibility

---

## SLIDE 5: API Endpoints & Flusso

### Endpoint MVP

| # | HTTP | Route | Request | Response |
|---|------|-------|---------|----------|
| 1 | POST | `/api/trainers/register` | TrainerCreate | TrainerRead (201) |
| 2 | GET | `/api/trainers/search` | Query Params | List[TrainerSearchResponse] |
| 3 | POST | `/api/sessions` | SessionCreate | SessionRead (201) |

### Flusso Utente: "Prenotare una sessione con Marco Rossi"

```
1. Client: GET /api/trainers/search?location=Milano
   ↓ (API finds trainers in Milano)
   ← Response: [Marco, Anna, ...]

2. Client: POST /api/sessions
   {
     "trainer_id": 1,
     "user_id": 3,
     "date": "2026-03-15",
     "time": "10:00",
     "status": "scheduled"
   }
   ↓ (API validates: user exists, trainer exists, no conflict)
   ← Response: Session creata con id=101

3. Confirmation: Sessione prenotata con Marco per 15 marzo 10:00
```

### Gestione Errori
- 400 Bad Request: "Email already registered", "Invalid date format"
- 404 Not Found: "Trainer not found", "User not found"
- Messaggi HTTP standardizzati e descrittivi

---

## SLIDE 6: Struttura Progetto & Deliverables

### Organizzazione File

```
FITCONNECT/
├── main.py                   ← API FastAPI (DEMO con dati fittizi)
├── schemas.py                ← Pydantic models (COMPITO 1B)
├── examples.json             ← 3 esempi endpoint MVP
├── requirements.txt          ← Dipendenze (fastapi, uvicorn, pydantic)
├── README.md                 ← Documentazione completa
└── docs/
    ├── diagramma_uml.txt     ← UML in formato ASCII
    └── presentazione.md      ← Questa presentazione
```

### Come Avviare la Demo

```bash
# 1. Installare dipendenze
pip install fastapi uvicorn "pydantic[email]"

# 2. Avviare server
python -m uvicorn main:app --reload

# 3. Aprire browser
→ http://localhost:8000/docs (Swagger UI)
→ Prova gli endpoint interattivamente!
```

### Cosa Chi​ Valuta Vedrà

1. **Presentazione** (50%)
   - Problem, target audience, MVP ben spiegati
   - UML diagram descritto verbalmente
   - Flussi utente chiari

2. **Compito 1 - Analisi & Design** (30%)
   - Problem statement articolato ✅
   - Target audience identificato ✅
   - Requisiti funzionali >= 5 ✅
   - MVP + Future features ✅
   - UML diagram completo ✅

3. **Compito 1B - Schemi Pydantic** (20%)
   - 4 entità complete ✅
   - Pattern Base-Create-Read ✅
   - Validazioni Pydantic ✅
   - Relazioni 1:N e N:M ✅
   - Code ben strutturato ✅

---

## DOMANDE FREQUENTI (Q&A)

**Q: Perché "dimostrativo" e senza database?**
A: Perché la focus è su design e modellazione, non su implementation. 
   È più facile valutare la comprensione di UML e Pydantic.

**Q: Come scalo a production?**
A: Aggiungi:
   - SQLite/PostgreSQL (database persistente)
   - SQLAlchemy (ORM)
   - JWT auth + bcrypt
   - Pytest test suite
   - Docker + CI/CD

**Q: Posso usare questa base per il progetto finale?**
A: Sì! È stato progettato per crescere. Aggiungi database e ORM 
   mantenendo gli schemi Pydantic.

**Q: Quali sono i tre endpoint MVP?**
A: 1. POST /api/trainers/register
   2. GET /api/trainers/search
   3. POST /api/sessions

---

## PUNTI CHIAVE DA PRESENTARE

✅ **Problem**: Gap nel mercato fitness italiano
✅ **Solution**: Piattaforma (web) di matching trainer-cliente
✅ **MVP**: 3 funzionalità core, no distrazioni
✅ **Design-First**: UML prima dell'implementazione
✅ **Pydantic**: Modelli validati, type-safe
✅ **API**: REST standard con proper HTTP codes
✅ **Extensible**: Base per future phases (pagamenti, rating, mobile)

---

**Tempo Presentazione Consigliato**: 5-6 minuti
**Domande Commentate**: 2-3 minuti
**Tempo Totale**: ~8 minuti

---

*Ultima revisione: Marzo 2026*
*FitConnect - Progetto Universitario*
