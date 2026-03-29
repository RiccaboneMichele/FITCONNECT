# FitConnect - Documentazione API Dettagliata

## 📡 API REST - Versione MVP 1.0

Questa documentazione descrive i 3 endpoint principali del Minimum Viable Product di FitConnect.

**Base URL:** `http://localhost:8080/api`

**Formato:** JSON

**Codici HTTP:**
- `200 OK` - Richiesta riuscita
- `201 Created` - Risorsa creata con successo
- `400 Bad Request` - Errore nei parametri della richiesta
- `404 Not Found` - Risorsa non trovata
- `409 Conflict` - Conflitto (es. slot già prenotato)
- `500 Internal Server Error` - Errore del server

---

## 📋 Indice Endpoint

1. [POST /api/trainers/register](#1-post-apitrainersregister) - Registrazione Trainer
2. [GET /api/trainers/search](#2-get-apitrainerssearch) - Ricerca Trainer
3. [POST /api/sessions](#3-post-apisessions) - Prenotazione Sessione

---

## 1. POST /api/trainers/register

### Descrizione
Registra un nuovo personal trainer nel sistema con informazioni professionali, tariffe e specializzazioni.

### Endpoint
```
POST /api/trainers/register
```

### Headers Richiesti
```http
Content-Type: application/json
```

### Request Body

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `user_id` | integer | ✅ Sì | ID dell'utente già registrato con role='trainer' |
| `bio` | string | ❌ No | Biografia del trainer (max 500 caratteri) |
| `hourly_rate` | float | ✅ Sì | Tariffa oraria in euro (deve essere > 0) |
| `location` | string | ✅ Sì | Città o zona del trainer |
| `experience_years` | integer | ✅ Sì | Anni di esperienza (>= 0) |
| `specialization_ids` | array[integer] | ✅ Sì | Array di ID delle specializzazioni |

### Esempio Request
```http
POST /api/trainers/register
Content-Type: application/json

{
  "user_id": 5,
  "bio": "Specializzato in powerlifting e allenamento funzionale. Certificato ISSA e NSCA. Ho preparato atleti per competizioni nazionali.",
  "hourly_rate": 35.0,
  "location": "Milano",
  "experience_years": 8,
  "specialization_ids": [1, 2]
}
```

### Response Success (201 Created)
```json
{
  "id": 1,
  "user": {
    "id": 5,
    "email": "marco.training@email.com",
    "name": "Marco Bianchi",
    "role": "trainer"
  },
  "bio": "Specializzato in powerlifting e allenamento funzionale. Certificato ISSA e NSCA. Ho preparato atleti per competizioni nazionali.",
  "hourly_rate": 35.0,
  "location": "Milano",
  "experience_years": 8,
  "specializations": [
    {
      "id": 1,
      "name": "Powerlifting"
    },
    {
      "id": 2,
      "name": "Allenamento Funzionale"
    }
  ],
  "created_at": "2026-03-07T14:30:00Z"
}
```

### Possibili Errori

#### Errore 400 - User ID non valido
```json
{
  "detail": "User not found or user role is not 'trainer'"
}
```

#### Errore 400 - Tariffa non valida
```json
{
  "detail": "hourly_rate must be greater than 0"
}
```

#### Errore 409 - Trainer già registrato
```json
{
  "detail": "User is already registered as trainer"
}
```

#### Errore 400 - Specializzazione non esistente
```json
{
  "detail": "Specialization with id 99 does not exist"
}
```

### Validazioni
- ✅ `user_id` deve esistere e avere `role='trainer'`
- ✅ `hourly_rate` deve essere maggiore di 0
- ✅ `experience_years` deve essere >= 0
- ✅ Tutti i `specialization_ids` devono esistere nel sistema
- ✅ Un utente può registrarsi come trainer una sola volta

### Entità Coinvolte
- `User` (lettura)
- `Trainer` (creazione)
- `Specialization` (lettura)
- `TrainerSpecialization` (creazione relazioni N:M)

---

## 2. GET /api/trainers/search

### Descrizione
Cerca trainer nel sistema applicando filtri opzionali per specializzazione, località e tariffa massima. Tutti i parametri sono opzionali - senza filtri restituisce tutti i trainer disponibili.

### Endpoint
```
GET /api/trainers/search
```

### Query Parameters

| Parametro | Tipo | Obbligatorio | Descrizione |
|-----------|------|--------------|-------------|
| `specialization` | string | ❌ No | Nome della specializzazione (es. "powerlifting", "yoga") |
| `location` | string | ❌ No | Città o zona (ricerca case-insensitive, partial match) |
| `max_price` | float | ❌ No | Tariffa oraria massima in euro |

### Esempi di Utilizzo

#### Esempio 1: Nessun filtro (tutti i trainer)
```http
GET /api/trainers/search
```

#### Esempio 2: Solo per location
```http
GET /api/trainers/search?location=Milano
```

#### Esempio 3: Specializzazione e tariffa massima
```http
GET /api/trainers/search?specialization=powerlifting&max_price=40
```

#### Esempio 4: Tutti i filtri combinati
```http
GET /api/trainers/search?specialization=powerlifting&location=Milano&max_price=40
```

### Response Success (200 OK)
```json
[
  {
    "id": 1,
    "name": "Marco Bianchi",
    "bio": "Specializzato in powerlifting e allenamento funzionale",
    "hourly_rate": 35.0,
    "location": "Milano",
    "experience_years": 8,
    "specializations": ["Powerlifting", "Allenamento Funzionale"]
  },
  {
    "id": 3,
    "name": "Giuseppe Verdi",
    "bio": "Powerlifter agonista con esperienza in preparazione atletica",
    "hourly_rate": 40.0,
    "location": "Milano",
    "experience_years": 12,
    "specializations": ["Powerlifting", "Preparazione Atletica"]
  }
]
```

### Response - Nessun Risultato (200 OK)
```json
[]
```

### Note Importanti
- I filtri si combinano con logica **AND** (tutti i filtri devono essere soddisfatti)
- La ricerca per `location` è **case-insensitive** e supporta **partial match**
  - Es. "Milano" trova anche "Milano Centro", "Milano Sud", ecc.
- La ricerca per `specialization` è **exact match** (case-insensitive)
- Se `max_price` è specificato, vengono restituiti solo trainer con `hourly_rate <= max_price`
- I risultati sono ordinati per `hourly_rate` crescente

### Entità Coinvolte
- `Trainer` (lettura)
- `User` (join per ottenere nome)
- `Specialization` (lettura tramite relazione N:M)
- `TrainerSpecialization` (join per filtrare)

---

## 3. POST /api/sessions

### Descrizione
Permette a un cliente di prenotare una sessione di allenamento one-to-one con un trainer specifico. Il sistema valida automaticamente la disponibilità del trainer nello slot selezionato.

### Endpoint
```
POST /api/sessions
```

### Headers Richiesti
```http
Content-Type: application/json
```

### Request Body

| Campo | Tipo | Obbligatorio | Descrizione |
|-------|------|--------------|-------------|
| `client_id` | integer | ✅ Sì | ID del cliente che prenota |
| `trainer_id` | integer | ✅ Sì | ID del trainer con cui prenotare |
| `date` | string | ✅ Sì | Data della sessione (formato: YYYY-MM-DD) |
| `time` | string | ✅ Sì | Ora di inizio (formato: HH:MM, es. "10:00") |
| `notes` | string | ❌ No | Note aggiuntive per il trainer (max 1000 caratteri) |

### Esempio Request
```http
POST /api/sessions
Content-Type: application/json

{
  "client_id": 10,
  "trainer_id": 1,
  "date": "2026-07-15",
  "time": "10:00",
  "notes": "Prima sessione, focus su tecnica di base per squat e deadlift"
}
```

### Response Success (201 Created)
```json
{
  "id": 123,
  "client": {
    "id": 10,
    "name": "Luca Rossi",
    "fitness_level": "beginner"
  },
  "trainer": {
    "id": 1,
    "name": "Marco Bianchi",
    "location": "Milano",
    "hourly_rate": 35.0
  },
  "date": "2026-07-15",
  "time": "10:00",
  "status": "scheduled",
  "notes": "Prima sessione, focus su tecnica di base per squat e deadlift",
  "created_at": "2026-03-07T15:45:00Z",
  "message": "Sessione prenotata con successo"
}
```

### Possibili Errori

#### Errore 404 - Cliente non trovato
```json
{
  "detail": "Client with id 10 does not exist"
}
```

#### Errore 404 - Trainer non trovato
```json
{
  "detail": "Trainer with id 1 does not exist"
}
```

#### Errore 400 - Data non valida
```json
{
  "detail": "Date must be in the future (format: YYYY-MM-DD)"
}
```

#### Errore 400 - Ora non valida
```json
{
  "detail": "Time must be in format HH:MM (00:00 to 23:59)"
}
```

#### Errore 409 - Slot già occupato
```json
{
  "detail": "This time slot is already booked for this trainer. Please choose a different time."
}
```

### Validazioni
- ✅ `client_id` deve esistere nella tabella `client`
- ✅ `trainer_id` deve esistere nella tabella `trainer`
- ✅ `date` deve essere nel futuro (>= data odierna)
- ✅ `time` deve essere in formato HH:MM valido
- ✅ Lo slot (trainer + date + time) non deve essere già occupato
- ✅ Viene applicato il vincolo UNIQUE(trainer_id, date, time) per status != 'cancelled'

### Logica di Business

#### Verifica Conflitto
Prima di creare la sessione, il sistema esegue:
```sql
SELECT COUNT(*) FROM session
WHERE trainer_id = ? 
  AND date = ? 
  AND time = ? 
  AND status != 'cancelled'
```
Se COUNT > 0, restituisce errore 409.

#### Status della Sessione
Le sessioni vengono create con:
- **status = 'scheduled'** (predefinito alla creazione)

Gli status possibili sono:
- `scheduled` - Sessione confermata e programmata
- `completed` - Sessione completata
- `cancelled` - Sessione cancellata

### Entità Coinvolte
- `Session` (creazione) - **Relazione N:1 con Client e Trainer**
- `Client` (lettura)
- `Trainer` (lettura)
- `User` (join per nomi)

---

## 🔐 Autenticazione (Future Implementation)

Nelle versioni future, tutti gli endpoint richiederanno autenticazione tramite JWT token:

```http
Authorization: Bearer <jwt_token>
```

Per ora, nel MVP, gli endpoint sono pubblici per semplificare i test.

---

## 📊 Codici di Risposta HTTP

| Codice | Nome | Quando viene usato |
|--------|------|-------------------|
| 200 | OK | Operazione riuscita (GET, PATCH, DELETE) |
| 201 | Created | Risorsa creata con successo (POST) |
| 400 | Bad Request | Parametri mancanti o non validi |
| 404 | Not Found | Risorsa non trovata |
| 409 | Conflict | Conflitto (es. doppia prenotazione) |
| 500 | Internal Server Error | Errore imprevisto del server |

---

## 🧪 Testing degli Endpoint

### Usando cURL

#### Registrazione Trainer
```bash
curl -X POST http://localhost:8080/api/trainers/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 5,
    "bio": "Trainer professionista",
    "hourly_rate": 35.0,
    "location": "Milano",
    "experience_years": 8,
    "specialization_ids": [1, 2]
  }'
```

#### Ricerca Trainer
```bash
curl "http://localhost:8080/api/trainers/search?location=Milano&max_price=40"
```

#### Prenotazione Sessione
```bash
curl -X POST http://localhost:8080/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": 10,
    "trainer_id": 1,
    "date": "2026-07-15",
    "time": "10:00",
    "notes": "Prima sessione"
  }'
```

### Usando Swagger UI

Apri il browser su:
```
http://localhost:8080/docs
```

Qui potrai:
- Vedere tutti gli endpoint disponibili
- Testare le API interattivamente
- Vedere gli schemi JSON di richiesta/risposta
- Visualizzare i codici di errore

---

## 📝 Note Implementative

### Gestione Date e Orari
- Tutte le date sono in formato **ISO 8601**: `YYYY-MM-DD`
- Gli orari sono in formato **24h**: `HH:MM`
- I timestamp completi includono timezone: `2026-03-07T15:45:00Z`

### Validazione Lato Server
Tutte le validazioni vengono eseguite lato server:
- Controllo esistenza foreign keys
- Validazione formati (date, email, ecc.)
- Business logic (conflitti, duplicati, ecc.)

### Performance
- Le query di ricerca trainer utilizzano indici su:
  - `trainer.location`
  - `trainer.hourly_rate`
  - `specialization.name`
- 

Le query di verifica conflitti utilizzano:
  - Indice composito su `(trainer_id, date, time)`

---

## 🔮 Endpoint Futuri (Post-MVP)

### Versione 2.0 - Pianificata Q2 2026

```
GET    /api/trainers/{id}             - Dettaglio singolo trainer
PATCH  /api/sessions/{id}             - Modifica/cancella sessione
GET    /api/sessions?client_id={id}   - Sessioni di un cliente
GET    /api/sessions?trainer_id={id}  - Sessioni di un trainer
POST   /api/reviews                   - Lascia recensione
GET    /api/trainers/{id}/reviews     - Recensioni di un trainer
POST   /api/auth/login                - Login con JWT
POST   /api/auth/register             - Registrazione completa
```

---

## 📚 Risorse Aggiuntive

- **Schema Database:** Vedi `diagramma_uml_completo.txt`
- **Esempi JSON:** Vedi `examples_api.json`
- **Analisi Completa:** Vedi `compito1_analisi.md`

---

**Versione Documento:** 1.0  
**Ultima Modifica:** 7 Marzo 2026  
**Autore:** FitConnect Development Team
