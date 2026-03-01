# FitConnect

Una piattaforma FastAPI che connette personal trainer e clienti.

## Struttura del progetto

```
FITCONNECT/
├── main.py          # FastAPI app ed endpoint
├── models.py        # Modelli SQLAlchemy (database)
├── schemas.py       # Modelli Pydantic (validazione)
├── database.py      # Connessione al database SQLite
├── auth.py          # Autenticazione JWT e hashing password
├── test_main.py     # Test degli endpoint
├── examples.json    # Esempi di richieste/risposte
└── requirements.txt # Dipendenze Python
```

## Setup

### 1. Creare un ambiente virtuale

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

### 2. Installare le dipendenze

```bash
pip install -r requirements.txt
```

### 3. Avviare il server

```bash
uvicorn main:app --reload
```

Il server sarà disponibile su `http://localhost:8000`.

La documentazione interattiva (Swagger UI) è accessibile su `http://localhost:8000/docs`.

## Endpoint API

| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| `POST` | `/api/trainers/register` | Registrazione nuovo trainer |
| `GET` | `/api/trainers/search` | Ricerca trainer con filtri |
| `POST` | `/api/sessions` | Prenotazione sessione |

### POST /api/trainers/register

Registra un nuovo trainer con il relativo account utente.

**Corpo della richiesta:**
```json
{
  "user": {
    "email": "trainer@example.com",
    "name": "Mario Rossi",
    "role": "trainer",
    "password": "secret"
  },
  "bio": "Trainer esperto",
  "hourly_rate": 50.0,
  "location": "Roma",
  "specialization_ids": []
}
```

### GET /api/trainers/search

Ricerca trainer con filtri opzionali.

**Parametri query:**
- `location` – filtra per città
- `specialization` – filtra per nome specializzazione
- `max_rate` – filtra per tariffa oraria massima

**Esempio:** `GET /api/trainers/search?location=Roma&max_rate=60`

### POST /api/sessions

Prenota una sessione di allenamento.

**Corpo della richiesta:**
```json
{
  "date": "2026-04-15",
  "time": "09:00",
  "status": "pending",
  "trainer_id": 1,
  "user_id": 2
}
```

## Test

```bash
pytest test_main.py -v
```

## Variabili d'ambiente

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `SECRET_KEY` | `fitconnect-secret-key-change-in-production` | Chiave segreta per JWT |

> ⚠️ In produzione impostare `SECRET_KEY` con un valore sicuro e casuale.
