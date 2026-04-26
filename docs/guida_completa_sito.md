# FitConnect - Guida Completa del Sito

## 1. Obiettivo del progetto
FitConnect e una piattaforma web che collega clienti e personal trainer.
Include:
- autenticazione JWT con ruoli (`client`, `trainer`, `admin`)
- gestione profili cliente/trainer
- prenotazione sessioni
- chat privata cliente-trainer
- dashboard amministrativa con statistiche e gestione utenti/contatti

Stack principale:
- Backend: FastAPI + SQLAlchemy
- Frontend: React + React Router + React Query + Zustand
- DB: SQLite/PostgreSQL (config lato backend)

## 2. Avvio del sistema (startup end-to-end)

### 2.1 Avvio con script unico
Lo script [run.sh](../run.sh) fa tutto in sequenza:
1. crea/valida la virtualenv Python (`.venv`)
2. installa dipendenze backend (`backend/requirements.txt`)
3. installa dipendenze frontend (`frontend/package.json`)
4. verifica le porte 8080 (backend) e 5173 (frontend)
5. avvia backend e frontend in parallelo

URL principali dopo avvio:
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/docs`
- Frontend: `http://localhost:5173`

### 2.2 Startup backend
Nel backend, all'avvio di FastAPI viene eseguito l'evento startup in [backend/main.py](../backend/main.py):
- `init_db()` crea/inizializza schema database
- `create_sample_data()` inserisce dati demo (utenti e profili iniziali)

Questo rende subito disponibile il login di test (admin/trainer/client) descritto nel root endpoint `/`.

### 2.3 Bootstrap frontend
Il frontend parte da [frontend/src/main.jsx](../frontend/src/main.jsx):
- inizializza React Query
- inizializza provider i18n
- monta il router
- monta toaster notifiche

Le rotte sono definite in [frontend/src/App.jsx](../frontend/src/App.jsx), con:
- route pubbliche
- route protette (utente autenticato)
- route admin

## 3. Flusso applicativo completo (dal primo accesso alle feature)

## 3.1 Utente non autenticato
L'utente puo:
- vedere home, pagina trainer, dettaglio trainer, pagine info
- registrarsi (`/register`)
- fare login (`/login`)

Non puo accedere a:
- dashboard
- profilo personale
- sessioni
- booking
- area admin

## 3.2 Registrazione e login

### Registrazione
Frontend chiama `POST /api/auth/register` (servizio in [frontend/src/services/api.js](../frontend/src/services/api.js)).
Il backend:
1. valida email univoca
2. crea utente
3. se ruolo client/trainer e presenti dati dedicati, crea anche il profilo associato
4. scrive audit log

### Login
Frontend invia form-data a `POST /api/auth/login` con `username=email` e `password`.
Backend:
1. verifica credenziali
2. genera JWT
3. ritorna `access_token` + dati utente
4. salva audit log login

Zustand store in [frontend/src/store/authStore.js](../frontend/src/store/authStore.js):
- salva token in `localStorage`
- aggiorna stato `isAuthenticated`
- mantiene sessione persistente

Axios interceptor in [frontend/src/services/api.js](../frontend/src/services/api.js):
- aggiunge automaticamente `Authorization: Bearer <token>`
- su `401` pulisce sessione e reindirizza a `/login`

## 3.3 Dashboard per ruolo
In [frontend/src/pages/DashboardPage.jsx](../frontend/src/pages/DashboardPage.jsx):
- `admin` -> redirect a `/admin`
- `trainer` -> `TrainerDashboard`
- `client` -> `ClientDashboard`

### Dashboard Client
In [frontend/src/components/dashboard/ClientDashboard.jsx](../frontend/src/components/dashboard/ClientDashboard.jsx):
- carica sessioni via `GET /api/sessions`
- mostra sessioni programmate/completate e ore
- consente di andare alla ricerca trainer

### Dashboard Trainer
In [frontend/src/components/dashboard/TrainerDashboard.jsx](../frontend/src/components/dashboard/TrainerDashboard.jsx):
- carica sessioni (`GET /api/sessions`)
- calcola ricavi da sessioni completate
- gestisce chat private trainer-client:
  - lista conversazioni: `GET /api/trainers/me/chats`
  - messaggi conversazione: `GET /api/trainers/me/chats/{client_id}`
  - invio messaggio: `POST /api/trainers/me/chats/{client_id}`

### Dashboard Admin
In [frontend/src/pages/admin/AdminDashboard.jsx](../frontend/src/pages/admin/AdminDashboard.jsx):
- statistiche: `GET /api/admin/dashboard`
- gestione utenti:
  - lista `GET /api/users`
  - creazione `POST /api/users`
  - attiva/disattiva `PATCH /api/users/{user_id}/status`
  - eliminazione `DELETE /api/users/{user_id}`
- gestione contatti:
  - lista `GET /api/admin/contacts`
  - segna letto `PUT /api/admin/contacts/{contact_id}/read`

## 3.4 Ricerca trainer, dettaglio, booking

### Elenco trainer (pubblico)
Pagina trainers usa `GET /api/trainers` con filtri opzionali (`location`, `specialization`, `max_price`).

### Dettaglio trainer
Pagina dettaglio usa `GET /api/trainers/{trainer_id}`.
Da questa pagina il client puo:
- aprire chat con trainer
- andare a prenotazione sessione

### Prenotazione sessione
In [frontend/src/pages/BookingPage.jsx](../frontend/src/pages/BookingPage.jsx):
1. carica trainer (`GET /api/trainers/{id}`)
2. carica profilo client (`GET /api/clients/profile/me`)
3. invia prenotazione (`POST /api/sessions`)

Il backend controlla conflitti orari trainer; se slot occupato ritorna `409 Conflict`.

## 3.5 Chat (feature reale con persistenza backend)
Esistono 2 modalita principali:

1. Chat trainer specifico dal dettaglio trainer
- `GET /api/trainers/{trainer_id}/chat`
- `POST /api/trainers/{trainer_id}/chat`

2. Chat private del trainer autenticato
- `GET /api/trainers/me/chats`
- `GET /api/trainers/me/chats/{client_id}`
- `POST /api/trainers/me/chats/{client_id}`

Regole ruoli (backend):
- client puo leggere/scrivere solo la propria chat col trainer
- trainer puo leggere/scrivere solo chat proprie
- admin puo accedere con parametri richiesti

## 3.6 Report (segnalazioni)
Nel frontend esiste una UI report in [frontend/src/pages/TrainerDetailPage.jsx](../frontend/src/pages/TrainerDetailPage.jsx):
- modal con motivo e dettagli
- submit gestito localmente con `alert`

Importante: nel backend non esiste un endpoint dedicato ai report utente/trainer.
Quindi al momento il report e una funzione UI mock (non persistita a DB).

## 4. Modello permessi e sicurezza
Controlli lato backend in [backend/auth.py](../backend/auth.py) + dependency in [backend/main.py](../backend/main.py):
- `get_current_user`: richiede token valido
- `require_role([...])`: vincolo sui ruoli
- `require_admin`: accesso admin
- `require_permission(...)`: accesso per permesso specifico

Pattern usato:
- endpoint pubblici (trainer list, health, contacts, ecc.)
- endpoint protetti per utente autenticato
- endpoint solo admin

## 5. API complete per metodo HTTP
Base path API: `/api`

## 5.1 GET
- `/` (info app)
- `/api/health`
- `/api/auth/me`
- `/api/users`
- `/api/users/{user_id}`
- `/api/clients`
- `/api/clients/{client_id}`
- `/api/clients/profile/me`
- `/api/trainers`
- `/api/trainers/{trainer_id}`
- `/api/trainers/profile/me`
- `/api/trainers/{trainer_id}/chat`
- `/api/trainers/me/chats`
- `/api/trainers/me/chats/{client_id}`
- `/api/sessions`
- `/api/sessions/{session_id}`
- `/api/specializations`
- `/api/admin/dashboard`
- `/api/admin/contacts`
- `/api/admin/groups`

## 5.2 POST
- `/api/auth/register`
- `/api/auth/login`
- `/api/users`
- `/api/clients`
- `/api/trainers`
- `/api/trainers/{trainer_id}/chat`
- `/api/trainers/me/chats/{client_id}`
- `/api/sessions`
- `/api/specializations`
- `/api/contacts`

## 5.3 PUT
- `/api/users/{user_id}`
- `/api/clients/{client_id}`
- `/api/trainers/{trainer_id}`
- `/api/sessions/{session_id}`
- `/api/admin/contacts/{contact_id}/read`

## 5.4 PATCH
- `/api/users/{user_id}/status`

## 5.5 DELETE
- `/api/users/{user_id}`
- `/api/sessions/{session_id}`

## 6. Mappa pagine frontend
Route principali in [frontend/src/App.jsx](../frontend/src/App.jsx):
- Pubbliche: `/`, `/login`, `/register`, `/trainers`, `/trainers/:id`, `/info/*`
- Protette: `/dashboard`, `/profile`, `/sessions`, `/booking/:trainerId`
- Admin: `/admin`, `/admin/users`, `/admin/clients`, `/admin/contacts`

## 7. Cosa e gia completo vs cosa e mock
Gia completo (backend + frontend):
- auth JWT
- gestione utenti/clienti/trainer
- sessioni (crea/lista/modifica/cancella)
- chat trainer-client persistita
- dashboard admin con statistiche base

Mock/parziale:
- report/segnalazioni da trainer detail (solo UI, niente endpoint dedicato)
- pagine sessioni/profilo potrebbero essere ancora minimali lato UI

## 8. Riferimenti utili
- API backend: [backend/main.py](../backend/main.py)
- Servizi frontend API: [frontend/src/services/api.js](../frontend/src/services/api.js)
- Routing frontend: [frontend/src/App.jsx](../frontend/src/App.jsx)
- Avvio locale: [run.sh](../run.sh)
- Documentazione API breve esistente: [api_documentation.md](../api_documentation.md)
