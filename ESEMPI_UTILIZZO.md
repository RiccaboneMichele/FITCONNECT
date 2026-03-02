# 📱 FitConnect - Esempi di Utilizzo

Questa guida mostra scenari pratici di utilizzo dell'applicazione FitConnect.

---

## 🎯 Scenario 1: Maria cerca un trainer di Yoga a Roma

### Contesto
Maria, 28 anni, vive a Roma e vuole iniziare a praticare yoga. Cerca un trainer certificato nella sua città con tariffa massima di €45/ora.

### Step by Step

#### 1. Maria apre l'app e cerca trainer

**Richiesta**:
```http
GET /api/trainers/search?location=Roma&specialization=Yoga&max_rate=45.0
```

**Risposta**:
```json
[
  {
    "id": 2,
    "name": "Anna Bianchi",
    "location": "Roma",
    "hourly_rate": 40.0,
    "bio": "Istruttrice di yoga e pilates, diplomata IYENGAR",
    "specializations": ["Yoga", "Pilates"]
  }
]
```

#### 2. Maria decide di prenotare una sessione con Anna

**Richiesta**:
```http
POST /api/sessions
Content-Type: application/json

{
  "date": "2026-03-10",
  "time": "18:00",
  "status": "scheduled",
  "trainer_id": 2,
  "user_id": 3
}
```

**Risposta**:
```json
{
  "id": 102,
  "date": "2026-03-10",
  "time": "18:00",
  "status": "scheduled",
  "trainer": {
    "name": "Anna Bianchi",
    "location": "Roma",
    "hourly_rate": 40.0
  },
  "message": "✅ Sessione prenotata con successo!"
}
```

**Risultato**: Maria ha prenotato la sua prima sessione di yoga per il 10 marzo alle 18:00! 🧘‍♀️

---

## 💪 Scenario 2: Luca vuole allenarsi per powerlifting a Milano

### Contesto
Luca, 32 anni, abita a Milano e vuole prepararsi per una gara di powerlifting. Cerca un trainer esperto senza limiti di budget.

### Step by Step

#### 1. Luca cerca trainers specializzati in powerlifting a Milano

**Richiesta**:
```http
GET /api/trainers/search?location=Milano&specialization=Powerlifting
```

**Risposta**:
```json
[
  {
    "id": 1,
    "name": "Marco Rossi",
    "location": "Milano",
    "hourly_rate": 50.0,
    "bio": "Specializzato in powerlifting con 10 anni di esperienza",
    "specializations": ["Powerlifting", "CrossFit"]
  }
]
```

#### 2. Luca prenota 3 sessioni settimanali

**Sessione Lunedì**:
```http
POST /api/sessions
{
  "date": "2026-03-03",
  "time": "10:00",
  "trainer_id": 1,
  "user_id": 3,
  "status": "scheduled"
}
```

**Sessione Mercoledì**:
```http
POST /api/sessions
{
  "date": "2026-03-05",
  "time": "10:00",
  "trainer_id": 1,
  "user_id": 3,
  "status": "scheduled"
}
```

**Sessione Venerdì**:
```http
POST /api/sessions
{
  "date": "2026-03-07",
  "time": "10:00",
  "trainer_id": 1,
  "user_id": 3,
  "status": "scheduled"
}
```

**Risultato**: Luca ha un programma settimanale strutturato con Marco! 🏋️

---

## 🚀 Scenario 3: Sofia, nuova trainer, si registra sulla piattaforma

### Contesto
Sofia è una personal trainer di Torino specializzata in functional training e cardio. Vuole registrarsi su FitConnect per trovare nuovi clienti.

### Step by Step

#### 1. Sofia crea prima il suo account utente

**Richiesta**:
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "sofia.ferrari@example.com",
  "name": "Sofia Ferrari",
  "role": "trainer",
  "password": "SecurePass123!"
}
```

**Risposta**:
```json
{
  "id": 4,
  "email": "sofia.ferrari@example.com",
  "name": "Sofia Ferrari",
  "role": "trainer",
  "created_at": "2026-03-01T14:30:00"
}
```

#### 2. Sofia registra il suo profilo trainer

**Richiesta**:
```http
POST /api/trainers/register
Content-Type: application/json

{
  "user_id": 4,
  "bio": "Trainer certificata ISSA con specializzazione in functional training e preparazione atletica. 5 anni di esperienza.",
  "hourly_rate": 38.0,
  "location": "Torino",
  "specialization_ids": [2, 4]
}
```

**Risposta**:
```json
{
  "id": 3,
  "user_id": 4,
  "user": {
    "id": 4,
    "email": "sofia.ferrari@example.com",
    "name": "Sofia Ferrari",
    "role": "trainer"
  },
  "bio": "Trainer certificata ISSA con specializzazione in functional training...",
  "hourly_rate": 38.0,
  "location": "Torino",
  "specializations": [
    {"id": 2, "name": "CrossFit"},
    {"id": 4, "name": "Cardio"}
  ],
  "created_at": "2026-03-01T14:35:00"
}
```

**Risultato**: Sofia è ora visibile nella piattaforma e può ricevere prenotazioni! 🎉

---

## 📊 Scenario 4: Ricerca generica di tutti i trainer disponibili

### Contesto
Un potenziale cliente vuole vedere tutti i trainer disponibili sulla piattaforma prima di filtrare.

**Richiesta**:
```http
GET /api/trainers/search
```

**Risposta**:
```json
[
  {
    "id": 1,
    "name": "Marco Rossi",
    "location": "Milano",
    "hourly_rate": 50.0,
    "bio": "Specializzato in powerlifting con 10 anni di esperienza",
    "specializations": ["Powerlifting", "CrossFit"]
  },
  {
    "id": 2,
    "name": "Anna Bianchi",
    "location": "Roma",
    "hourly_rate": 40.0,
    "bio": "Istruttrice di yoga e pilates, diplomata IYENGAR",
    "specializations": ["Yoga", "Pilates"]
  },
  {
    "id": 3,
    "name": "Sofia Ferrari",
    "location": "Torino",
    "hourly_rate": 38.0,
    "bio": "Trainer certificata ISSA con specializzazione in functional training...",
    "specializations": ["CrossFit", "Cardio"]
  }
]
```

---

## 🔄 Scenario 5: Gestione cancellazione sessione

### Contesto
Maria deve cancellare la sua sessione del 10 marzo per un impegno imprevisto.

**Richiesta**:
```http
PATCH /api/sessions/102
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Risposta**:
```json
{
  "id": 102,
  "date": "2026-03-10",
  "time": "18:00",
  "status": "cancelled",
  "message": "Sessione cancellata con successo"
}
```

**Risultato**: Lo slot orario è ora di nuovo disponibile per altri clienti.

---

## 🎓 Scenario 6: Ricerca trainer economici per studenti

### Contesto
Giovanni è uno studente universitario con budget limitato. Cerca trainer con tariffa massima €35/ora.

**Richiesta**:
```http
GET /api/trainers/search?max_rate=35.0
```

**Risposta**:
```json
[]
```

**Nota**: Nessun trainer disponibile sotto €35/ora. Giovanni potrebbe:
- Aumentare il budget
- Cercare trainer in altre città
- Cercare pacchetti scontati (feature futura)

---

## 🌆 Scenario 7: Confronto trainer per città

### Ricerca trainer a Milano
```http
GET /api/trainers/search?location=Milano
```

**Risultato**: 1 trainer (Marco Rossi - €50/h)

### Ricerca trainer a Roma
```http
GET /api/trainers/search?location=Roma
```

**Risultato**: 1 trainer (Anna Bianchi - €40/h)

### Ricerca trainer a Torino
```http
GET /api/trainers/search?location=Torino
```

**Risultato**: 1 trainer (Sofia Ferrari - €38/h)

**Insight**: Torino ha le tariffe più competitive!

---

## 📋 Scenario 8: Verifica specializzazioni disponibili

### Contesto
Un utente vuole sapere quali specializzazioni sono supportate dalla piattaforma.

**Richiesta**:
```http
GET /api/specializations
```

**Risposta**:
```json
[
  {"id": 1, "name": "Powerlifting"},
  {"id": 2, "name": "CrossFit"},
  {"id": 3, "name": "Yoga"},
  {"id": 4, "name": "Cardio"},
  {"id": 5, "name": "Pilates"}
]
```

---

## 💡 Scenario 9: Filtri combinati avanzati

### Contesto
Cliente cerca trainer a Roma, con specializzazione Pilates, tariffa max €45/h.

**Richiesta**:
```http
GET /api/trainers/search?location=Roma&specialization=Pilates&max_rate=45.0
```

**Risposta**:
```json
[
  {
    "id": 2,
    "name": "Anna Bianchi",
    "location": "Roma",
    "hourly_rate": 40.0,
    "bio": "Istruttrice di yoga e pilates, diplomata IYENGAR",
    "specializations": ["Yoga", "Pilates"]
  }
]
```

**Risultato**: Anna è perfetta per questo cliente! ✅

---

## ❌ Scenario 10: Gestione errori comuni

### Tentativo di prenotare slot già occupato

**Richiesta**:
```http
POST /api/sessions
{
  "date": "2026-03-15",
  "time": "10:00",
  "trainer_id": 1,
  "user_id": 3,
  "status": "scheduled"
}
```

**Prima chiamata**: ✅ Successo (201 Created)

**Seconda chiamata** (stesso slot):
```json
{
  "detail": "This time slot is already booked"
}
```
**Status**: 400 Bad Request ❌

### Tentativo di registrare lo stesso trainer due volte

**Richiesta**:
```http
POST /api/trainers/register
{
  "user_id": 1,
  "bio": "...",
  "hourly_rate": 45.0,
  "location": "Milano",
  "specialization_ids": [1]
}
```

**Risposta**:
```json
{
  "detail": "User is already registered as trainer"
}
```
**Status**: 400 Bad Request ❌

---

## 📈 Metriche di Successo (Esempi Ipotetici)

Se FitConnect fosse in produzione:

| Metrica | Valore |
|---------|--------|
| Trainer registrati | 1,234 |
| Clienti attivi | 8,567 |
| Sessioni prenotate (mese) | 3,456 |
| Tariffa media | €42.50/h |
| Città più attive | Milano, Roma, Torino |
| Specializzazione più richiesta | Yoga (35%), CrossFit (28%) |

---

## 🚀 Come Testare Questi Scenari

1. **Avvia il server**:
   ```bash
   ./start.sh
   ```

2. **Apri Swagger UI**:
   ```
   http://localhost:8000/docs
   ```

3. **Prova gli endpoint interattivamente**:
   - Clicca su un endpoint
   - Clicca "Try it out"
   - Inserisci i parametri
   - Clicca "Execute"

4. **Oppure usa curl**:
   ```bash
   # Ricerca trainer
   curl "http://localhost:8000/api/trainers/search?location=Milano"
   
   # Prenota sessione
   curl -X POST "http://localhost:8000/api/sessions" \
     -H "Content-Type: application/json" \
     -d '{"date":"2026-03-15","time":"10:00","trainer_id":1,"user_id":3,"status":"scheduled"}'
   ```

---

**FitConnect** - Connettere persone attraverso il fitness! 🏋️‍♀️🧘‍♂️💪
