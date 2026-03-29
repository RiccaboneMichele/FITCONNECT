# FitConnect

Piattaforma web completa per connettere trainer e clienti, con backend FastAPI + SQLAlchemy e frontend React + Vite.

## Stato Attuale

- Backend API con autenticazione JWT e ruoli admin/trainer/client.
- Dashboard admin con gestione utenti (creazione, attiva/disattiva, elimina).
- Flusso trainer/client con chat privata e prenotazioni sessioni.
- Database SQLite locale con dati demo e script di avvio/reset.

## Stack Tecnologico

### Backend

- FastAPI
- SQLAlchemy
- Pydantic v2
- JWT (python-jose)
- Passlib bcrypt
- Uvicorn

### Frontend

- React 18
- Vite
- React Router
- React Query
- Zustand
- Axios
- Tailwind CSS

## Avvio Rapido

Dalla root del progetto:

```bash
chmod +x run.sh
./run.sh
```

Servizi disponibili:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/docs

Credenziali demo:

- Admin: admin@fitconnect.com / admin123
- Trainer: marco.trainer@fitconnect.com / trainer123
- Client: luca.client@fitconnect.com / client123

## Setup Manuale

### 1) Backend

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Struttura Progetto

```text
FITCONNECT/
  backend/
    main.py
    auth.py
    crud.py
    database.py
    models.py
    schemas.py
    migrate_db.py
    reset_database.py
    requirements.txt
  frontend/
    package.json
    vite.config.js
    src/
      App.jsx
      services/api.js
      store/authStore.js
      pages/
      components/
  run.sh
  reset.sh
  requirements.txt
```

## Funzionalita Implementate

### Autenticazione e Ruoli

- Login JWT e route protette.
- Ruoli: admin, trainer, client.
- Middleware di autorizzazione lato backend.

### Admin

- Dashboard con statistiche principali.
- Gestione utenti:
  - creazione nuovo utente
  - attivazione/disattivazione
  - eliminazione
- Vista clienti con dettagli profilo.

### Trainer

- Dashboard sessioni.
- Chat private con clienti:
  - lista conversazioni
  - lettura messaggi per cliente
  - invio risposta

### Client

- Ricerca trainer.
- Pagina dettaglio trainer.
- Prenotazione sessione con validazione data/orario.

## Endpoint Principali

### Auth

- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me

### Users (Admin)

- GET /api/users
- POST /api/users
- PUT /api/users/{user_id}
- PATCH /api/users/{user_id}/status
- DELETE /api/users/{user_id}

### Trainers

- GET /api/trainers
- GET /api/trainers/{trainer_id}
- GET /api/trainers/{trainer_id}/chat
- POST /api/trainers/{trainer_id}/chat
- GET /api/trainers/me/chats
- GET /api/trainers/me/chats/{client_id}
- POST /api/trainers/me/chats/{client_id}

### Sessions

- GET /api/sessions
- POST /api/sessions
- GET /api/sessions/{session_id}
- PUT /api/sessions/{session_id}
- DELETE /api/sessions/{session_id}

## Test e Utility

- Test backend veloce:

```bash
chmod +x test_backend.sh
./test_backend.sh
```

- Reset database:

```bash
./reset.sh
```

## Note Operative

- Il progetto usa sia file nella root sia nella cartella backend; il runtime principale usa backend/main.py.
- Se cambi schemas o endpoint backend, riavvia sempre il server backend.
- In caso di problemi DB, usa reset script e riavvia con run.sh.


