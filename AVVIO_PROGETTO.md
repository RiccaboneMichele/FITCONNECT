# 🚀 FitConnect - Guida Avvio Rapido

## Prerequisiti

- Python 3.8 o superiore
- pip (package manager Python)

## Metodo 1: Script Automatici (Consigliato)

### Passo 1: Rendi eseguibili gli script

```bash
chmod +x install.sh start.sh
```

### Passo 2: Installa le dipendenze

```bash
./install.sh
```

### Passo 3: Avvia il server

```bash
./start.sh
```

## Metodo 2: Manuale

### Passo 1: Crea e attiva virtual environment

```bash
# Crea venv (se non esiste già)
python3 -m venv .venv

# Attiva su Linux/Mac
source .venv/bin/activate

# Attiva su Windows
.venv\Scripts\activate
```

### Passo 2: Installa dipendenze

```bash
pip install fastapi uvicorn "pydantic[email]"
```

### Passo 3: Avvia il server

```bash
uvicorn main:app --reload
```

## Accesso all'API

Dopo l'avvio vedrai:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### URL Disponibili

- **API Root**: http://localhost:8000/
- **Swagger UI (Documentazione Interattiva)**: http://localhost:8000/docs
- **ReDoc (Documentazione Alternativa)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Test degli Endpoint MVP

### 1. Ricerca Trainer

Apri il browser su http://localhost:8000/docs e prova:

```
GET /api/trainers/search
GET /api/trainers/search?location=Milano
GET /api/trainers/search?max_rate=45.0
```

### 2. Registrazione Trainer

```
POST /api/trainers/register
Body:
{
  "user_id": 1,
  "bio": "Trainer specializzato in CrossFit",
  "hourly_rate": 45.0,
  "location": "Torino",
  "specialization_ids": [2]
}
```

### 3. Prenotazione Sessione

```
POST /api/sessions
Body:
{
  "date": "2026-03-20",
  "time": "15:00",
  "status": "scheduled",
  "trainer_id": 1,
  "user_id": 3
}
```

## Struttura File Progetto

```
FITCONNECT/
├── main.py                   # API FastAPI con dati dimostrativi
├── schemas.py                # Modelli Pydantic (Compito 1B)
├── examples.json             # 3 esempi JSON per MVP
├── requirements.txt          # Lista dipendenze complete
├── README.md                 # Documentazione completa
├── install.sh               # Script installazione
├── start.sh                 # Script avvio server
├── AVVIO_PROGETTO.md        # Questa guida
└── docs/
    ├── diagramma_uml.txt    # Diagramma UML ASCII
    └── presentazione.md     # Slide presentazione
```

## Note Importanti

⚠️ **PROGETTO DIMOSTRATIVO**

Questo progetto:
- ✅ Contiene API funzionante con dati fittizi
- ✅ Implementa tutti i modelli Pydantic richiesti
- ✅ Valida gli input correttamente
- ✅ Gestisce errori con codici HTTP appropriati
- ❌ NON usa database reale (dati in memoria)
- ❌ NON usa SQLAlchemy/ORM
- ❌ NON include autenticazione JWT
- ❌ NON include frontend React

È progettato per dimostrare:
1. **Analisi & Design** (UML, requisiti, MVP)
2. **Schemi Pydantic** (validazione, relazioni, patterns)
3. **Struttura API REST** (endpoint, HTTP codes, documentazione)

## Troubleshooting

### "Command 'uvicorn' not found"

Assicurati di aver attivato il virtual environment:
```bash
source .venv/bin/activate
```

### "ModuleNotFoundError: No module named 'fastapi'"

Installa le dipendenze:
```bash
pip install fastapi uvicorn "pydantic[email]"
```

### "Address already in use"

La porta 8000 è già occupata. Usa una porta diversa:
```bash
uvicorn main:app --reload --port 8001
```

### Problemi con .venv su Windows

Se hai problemi con l'esecuzione degli script su Windows, usa PowerShell:
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi uvicorn "pydantic[email]"
python -m uvicorn main:app --reload
```

## Supporto

Per domande o problemi, consulta:
- 📖 README.md (documentazione completa)
- 📄 docs/presentazione.md (dettagli progetto)
- 🌐 http://localhost:8000/docs (dopo l'avvio - documentazione interattiva)

---

**FitConnect** - Progetto Dimostrativo FastAPI  
Versione 1.0.0 - Marzo 2026
