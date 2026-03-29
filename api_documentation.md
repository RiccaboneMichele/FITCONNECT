# FitConnect - Documentazione API (Aggiornata)

## Panoramica
Documentazione pratica degli endpoint attivi nel backend corrente.

- Base URL: `http://localhost:8080`
- Prefisso API: `/api`
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

## Autenticazione
La maggior parte degli endpoint richiede JWT Bearer token.

Header:
```http
Authorization: Bearer <access_token>
```

Login usa `multipart/form-data` con `username` (email) e `password`.

## Codici HTTP principali
- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

---

## 1) Endpoints Info

### GET /
Ritorna informazioni generali del servizio.

### GET /api/health
Health check applicativo.

---

## 2) Auth

### POST /api/auth/register
Registra un utente.

Body (JSON):
```json
{
  "email": "utente@example.com",
  "name": "Nome Cognome",
  "password": "password123",
  "role": "client"
}
```

Note:
- `role` ammessi: `admin`, `trainer`, `client`.
- Se email esiste gia: `400`.

### POST /api/auth/login
Login utente.

Body (form-data):
- `username`: email
- `password`: password

Response:
```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "utente@example.com",
    "name": "Nome Cognome",
    "role": "client",
    "is_active": true,
    "is_admin": false,
    "created_at": "2026-03-29T10:00:00Z"
  }
}
```

### GET /api/auth/me
Restituisce utente autenticato.

---

## 3) Users (Admin e Self)

### GET /api/users
Solo admin. Lista utenti con filtri opzionali:
- `skip`, `limit`, `role`

### POST /api/users
Solo admin. Crea utente.

### GET /api/users/{user_id}
Admin oppure utente proprietario.

### PUT /api/users/{user_id}
Admin oppure utente proprietario.

### PATCH /api/users/{user_id}/status
Solo admin. Attiva/disattiva utente.

Body:
```json
{ "is_active": true }
```

### DELETE /api/users/{user_id}
Solo admin. Elimina utente.

---

## 4) Clients

### GET /api/clients
Admin o trainer. Lista clienti.

### GET /api/clients/{client_id}
Admin o proprietario del profilo client.

### GET /api/clients/profile/me
Profilo client dell'utente autenticato.

### POST /api/clients
Crea profilo client per utente autenticato (role client o admin).

Body tipico:
```json
{
  "user_id": 10,
  "phone": "+39 333 0000000",
  "birth_date": "1995-04-10",
  "fitness_level": "beginner",
  "address": "Torino",
  "notes": "Allenamento 3 volte a settimana"
}
```

Nota: `user_id` viene forzato lato server all'utente autenticato.

### PUT /api/clients/{client_id}
Aggiorna profilo client (admin o proprietario).

---

## 5) Trainers

### GET /api/trainers
Pubblico. Ricerca/lista trainer.

Query params opzionali:
- `location`
- `specialization`
- `max_price`
- `skip`, `limit`

### GET /api/trainers/{trainer_id}
Pubblico. Dettaglio trainer.

### GET /api/trainers/profile/me
Profilo trainer dell'utente autenticato.

### POST /api/trainers
Crea profilo trainer (role trainer o admin).

### PUT /api/trainers/{trainer_id}
Aggiorna profilo trainer (admin o proprietario).

### GET /api/trainers/{trainer_id}/chat
Messaggi chat trainer-client.

Regole:
- `client`: legge la chat col trainer usando il proprio client profile.
- `trainer/admin`: deve passare `client_id`.

Query params:
- `client_id` (richiesto per trainer/admin)
- `limit` (default 100)

### POST /api/trainers/{trainer_id}/chat
Invio messaggio trainer-client.

Body:
```json
{
  "message": "Ciao!",
  "client_id": 1
}
```

`client_id` per `client` viene risolto automaticamente dal backend.

### GET /api/trainers/me/chats
Solo trainer/admin. Lista conversazioni private del trainer autenticato.

### GET /api/trainers/me/chats/{client_id}
Solo trainer/admin. Messaggi privati con cliente specifico.

### POST /api/trainers/me/chats/{client_id}
Solo trainer/admin. Invia messaggio privato al cliente.

---

## 6) Sessions

### GET /api/sessions
Lista sessioni visibili all'utente autenticato.

Filtri opzionali:
- `client_id`, `trainer_id` (limitati dal ruolo)
- `status`
- `date_from`, `date_to`
- `skip`, `limit`

### GET /api/sessions/{session_id}
Dettaglio sessione (admin o partecipanti della sessione).

### POST /api/sessions
Crea prenotazione sessione.

Body:
```json
{
  "client_id": 1,
  "trainer_id": 2,
  "date": "2026-04-02",
  "time": "18:30",
  "notes": "Prima valutazione"
}
```

Regole:
- Se role `client`, puo prenotare solo per il proprio `client_id`.
- Se slot trainer gia occupato, ritorna `409`.

### PUT /api/sessions/{session_id}
Aggiorna sessione (solo trainer della sessione o admin).

### DELETE /api/sessions/{session_id}
Annulla sessione (partecipanti o admin).

---

## 7) Specializations

### GET /api/specializations
Pubblico. Lista specializzazioni.

### POST /api/specializations
Solo admin. Crea specializzazione.

---

## 8) Contacts

### POST /api/contacts
Pubblico. Invio messaggio contatto.

Body:
```json
{
  "name": "Mario",
  "email": "mario@example.com",
  "phone": "+39 333 0000000",
  "subject": "Info abbonamento",
  "message": "Vorrei maggiori dettagli"
}
```

---

## 9) Admin

### GET /api/admin/dashboard
Solo admin. Statistiche piattaforma.

### GET /api/admin/contacts
Admin con permesso `manage_users`.

Filtri:
- `is_read`
- `skip`, `limit`

### PUT /api/admin/contacts/{contact_id}/read
Solo admin. Segna contatto come letto.

### GET /api/admin/groups
Solo admin. Lista gruppi e permessi.

---

## Esempi rapidi cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: multipart/form-data" \
  -F "username=admin@fitconnect.com" \
  -F "password=admin123"
```

### Ricerca trainer
```bash
curl "http://localhost:8080/api/trainers?location=Torino&max_price=45"
```

### Prenotazione sessione
```bash
curl -X POST http://localhost:8080/api/sessions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 1,
    "trainer_id": 2,
    "date": "2026-04-10",
    "time": "17:30",
    "notes": "Sessione prova"
  }'
```

---

## Note finali
- Questa documentazione riflette l'implementazione attuale in `backend/main.py`.
- Per schema request/response completo e sempre aggiornato, usare `http://localhost:8080/docs`.
