# FitConnect - Analisi e Design del Progetto

## 📋 1. CONCEPT DEL PROGETTO

### Nome del Progetto
**FitConnect** - La piattaforma che connette personal trainer e clienti per sessioni di allenamento personalizzate

### Problem Statement

**Problema attuale:**
Oggi è difficile per i clienti trovare personal trainer qualificati e disponibili vicino a loro, e per i trainer è complicato gestire appuntamenti e progressi dei propri clienti. 

**Punti di dolore specifici:**
- **Per i Clienti:**
  - Difficoltà nel trovare trainer specializzati nelle discipline desiderate
  - Incertezza sulla qualità e le tariffe dei trainer
  - Mancanza di trasparenza su disponibilità e orari
  - Gestione manuale e confusa delle prenotazioni

- **Per i Trainer:**
  - Difficoltà nel farsi conoscere e acquisire nuovi clienti
  - Gestione inefficiente del calendario e degli appuntamenti
  - Mancanza di uno strumento centralizzato per organizzare le sessioni
  - Perdita di tempo in comunicazioni poco efficienti

**Soluzione proposta:**
FitConnect risolve questi problemi offrendo una piattaforma centralizzata che permette:
- Ricerca facile e veloce di trainer per specialità, zona geografica e fascia di prezzo
- Prenotazione diretta di sessioni di allenamento one-to-one
- Gestione organizzata di tutte le sessioni prenotate
- Profili dettagliati dei trainer con informazioni su esperienza e specializzazioni

---

## 🎯 2. TARGET AUDIENCE

### Segmento Primario: Clienti
**Chi sono:**
- Persone che cercano un personal trainer per allenamenti personalizzati
- Età: 18-55 anni
- Livello fitness: Principianti, intermedi e avanzati
- Motivazioni: Salute, estetica, preparazione sportiva, riabilitazione

**Obiettivi:**
- Trovare un trainer qualificato vicino a casa o alla palestra
- Prenotare sessioni in modo semplice e veloce
- Visualizzare chiaramente tariffe e disponibilità

### Segmento Secondario: Trainer
**Chi sono:**
- Professionisti del fitness che offrono sessioni private
- Personal trainer certificati e qualificati
- Specialisti in diverse discipline (powerlifting, yoga, functional training, ecc.)

**Obiettivi:**
- Acquisire nuovi clienti in modo efficace
- Gestire il calendario delle sessioni in modo organizzato
- Aumentare la visibilità del proprio profilo professionale

---

## ⚙️ 3. REQUISITI FUNZIONALI

### RF1: Registrazione e Autenticazione con Ruoli Distinti
**Descrizione:** Il sistema deve permettere la registrazione di utenti con ruoli distinti (cliente o trainer). Ogni utente deve poter effettuare login con credenziali sicure.

**Priorità:** 🔴 ALTA (MVP)

**Dettagli:**
- Registrazione con email, password, nome e ruolo
- Validazione email univoca
- Password criptata
- Distinzione tra profilo cliente e profilo trainer

---

### RF2: Ricerca Trainer per Specialità, Zona e Prezzo
**Descrizione:** I clienti devono poter cercare trainer applicando filtri multipli su specializzazione, zona geografica e tariffa oraria massima.

**Priorità:** 🔴 ALTA (MVP)

**Dettagli:**
- Filtro per specializzazione (es. powerlifting, yoga, functional)
- Filtro per location/zona geografica (es. Milano, Roma)
- Filtro per tariffa oraria massima (es. max €40/h)
- Risultati ordinati per rilevanza

---

### RF3: Visualizzazione Profilo Completo Trainer
**Descrizione:** I clienti devono poter visualizzare il profilo completo di un trainer con tutte le informazioni rilevanti.

**Priorità:** 🔴 ALTA (MVP)

**Dettagli:**
- Biografia del trainer
- Anni di esperienza
- Specializzazioni
- Tariffa oraria
- Location
- Disponibilità

---

### RF4: Prenotazione Sessione con Trainer
**Descrizione:** I clienti devono poter prenotare una sessione di allenamento one-to-one con un trainer selezionato, specificando data, ora e eventuali note.

**Priorità:** 🔴 ALTA (MVP)

**Dettagli:**
- Selezione data e ora
- Validazione disponibilità trainer
- Aggiunta note opzionali
- Conferma immediata della prenotazione
- Nessun conflitto orario

---

### RF5: Visualizzazione Sessioni Prenotate per Trainer
**Descrizione:** I trainer devono poter visualizzare tutte le proprie sessioni prenotate, con informazioni su cliente, data, ora e status.

**Priorità:** 🔴 ALTA (MVP)

**Dettagli:**
- Lista completa delle sessioni
- Filtro per status (confermata, completata, cancellata)
- Informazioni sul cliente
- Calendario visuale

---

### RF6: Gestione Profilo Utente
**Descrizione:** Sia clienti che trainer devono poter modificare il proprio profilo con informazioni personali e preferenze.

**Priorità:** 🟡 MEDIA (Post-MVP)

---

### RF7: Notifiche e Promemoria
**Descrizione:** Il sistema deve inviare notifiche email per conferme di prenotazione e promemoria 24h prima della sessione.

**Priorità:** 🟡 MEDIA (Post-MVP)

---

## 🚀 4. DEFINIZIONE MVP (Minimum Viable Product)

### Funzionalità MVP - Versione 1.0

#### 1. Registrazione e Login (Clienti e Trainer)
- Un utente può registrarsi come cliente o trainer
- Login con email e password
- Profili base per entrambi i ruoli
- **Entità coinvolte:** User, Client, Trainer

#### 2. Ricerca e Filtro Trainer (Specialità, Zona, Prezzo)
- Il cliente può cercare trainer applicando filtri
- Visualizzazione risultati di ricerca
- Profili trainer con informazioni complete
- **Entità coinvolte:** Trainer, Specialization

#### 3. Prenotazione Sessioni
- Il cliente può prenotare una sessione con un trainer
- Selezione data e ora
- Conferma prenotazione
- Visualizzazione sessioni per trainer
- **Entità coinvolte:** Session, Client, Trainer

**Timeline MVP:** 2-3 mesi di sviluppo

**Metriche di Successo MVP:**
- 50+ trainer registrati
- 200+ clienti registrati
- 500+ sessioni prenotate nel primo mese

---

## 🔮 5. FUTURE FEATURES (Post-MVP)

### Feature Future - Versione 2.0

#### 1. Sistema di Pagamento Integrato
**Descrizione:** Integrazione con Stripe o PayPal per pagamenti diretti sulla piattaforma

**Benefici:**
- Transazioni sicure e tracciabili
- Automatizzazione del processo di pagamento
- Wallet per trainer e clienti
- Fatturazione automatica

**Timeline:** Q2 2026

**Entità nuove:** Payment, Transaction

---

#### 2. Recensioni e Valutazioni dei Trainer
**Descrizione:** Sistema di rating a 5 stelle e recensioni testuali per i trainer

**Benefici:**
- Maggiore trasparenza e fiducia
- Aiuta i clienti nella scelta
- Incentiva i trainer a migliorare il servizio
- Reputazione verificata

**Timeline:** Q2 2026

**Entità nuove:** Review, Rating

---

#### 3. Pacchetti e Abbonamenti
**Descrizione:** Possibilità di acquistare pacchetti di sessioni a prezzo scontato

**Timeline:** Q3 2026

---

#### 4. Video Sessioni Online
**Descrizione:** Integrazione con Zoom/Google Meet per sessioni virtuali

**Timeline:** Q3 2026

---

#### 5. App Mobile
**Descrizione:** Applicazione nativa iOS e Android

**Timeline:** Q4 2026

---

## 📊 6. MODELLAZIONE DATI (DIAGRAMMA UML)

### Entità del Sistema

#### 1. User (Autenticazione)
**Attributi:**
- `id` (PK, INTEGER): Identificatore univoco
- `email` (VARCHAR, UNIQUE): Email per login
- `password_hash` (VARCHAR): Password criptata
- `name` (VARCHAR): Nome completo
- `role` (ENUM): Ruolo utente ['client', 'trainer']
- `created_at` (DATETIME): Data registrazione

**Relazioni:**
- 1:1 con Client (se role='client')
- 1:1 con Trainer (se role='trainer')

---

#### 2. Client
**Attributi:**
- `id` (PK, INTEGER): Identificatore univoco
- `user_id` (FK, INTEGER): Riferimento a User
- `phone` (VARCHAR, NULLABLE): Numero telefono
- `birth_date` (DATE, NULLABLE): Data di nascita
- `fitness_level` (ENUM): Livello fitness ['beginner', 'intermediate', 'advanced']
- `created_at` (DATETIME): Data creazione profilo

**Relazioni:**
- 1:1 con User
- **1:N con Session** (un cliente può avere molte sessioni) → **RELAZIONE N:1 DA SESSION**

---

#### 3. Trainer
**Attributi:**
- `id` (PK, INTEGER): Identificatore univoco
- `user_id` (FK, INTEGER): Riferimento a User
- `bio` (TEXT, NULLABLE): Biografia
- `hourly_rate` (DECIMAL): Tariffa oraria
- `location` (VARCHAR): Città/zona
- `experience_years` (INTEGER): Anni di esperienza
- `created_at` (DATETIME): Data creazione profilo

**Relazioni:**
- 1:1 con User
- **1:N con Session** (un trainer può tenere molte sessioni) → **RELAZIONE N:1 DA SESSION**
- N:M con Specialization (tramite tabella ponte)

---

#### 4. Session
**Attributi:**
- `id` (PK, INTEGER): Identificatore univoco
- `client_id` (FK, INTEGER): Riferimento a Client
- `trainer_id` (FK, INTEGER): Riferimento a Trainer
- `date` (DATE): Data sessione
- `time` (TIME): Ora sessione
- `status` (ENUM): Stato ['scheduled', 'completed', 'cancelled']
- `notes` (TEXT, NULLABLE): Note opzionali
- `created_at` (DATETIME): Data prenotazione

**Relazioni:**
- **N:1 con Client** (molte sessioni appartengono a un cliente)
- **N:1 con Trainer** (molte sessioni appartengono a un trainer)

**Vincoli:**
- UNIQUE(trainer_id, date, time) dove status != 'cancelled'

---

#### 5. Specialization
**Attributi:**
- `id` (PK, INTEGER): Identificatore univoco
- `name` (VARCHAR, UNIQUE): Nome specializzazione
- `description` (TEXT, NULLABLE): Descrizione

**Relazioni:**
- N:M con Trainer (tramite tabella ponte trainer_specialization)

---

#### 6. TrainerSpecialization (Tabella Ponte)
**Attributi:**
- `trainer_id` (FK, INTEGER): Riferimento a Trainer
- `specialization_id` (FK, INTEGER): Riferimento a Specialization

**Chiave Primaria:** (trainer_id, specialization_id)

---

### Riepilogo Relazioni

| Relazione | Tipo | Descrizione |
|-----------|------|-------------|
| User ↔ Client | 1:1 | Un user con role='client' ha un profilo Client |
| User ↔ Trainer | 1:1 | Un user con role='trainer' ha un profilo Trainer |
| **Client ↔ Session** | **1:N** | Un cliente può avere molte sessioni (vista da Client) |
| **Session → Client** | **N:1** | Molte sessioni appartengono a un cliente (vista da Session) ✅ |
| **Trainer ↔ Session** | **1:N** | Un trainer può tenere molte sessioni (vista da Trainer) |
| **Session → Trainer** | **N:1** | Molte sessioni appartengono a un trainer (vista da Session) ✅ |
| Trainer ↔ Specialization | N:M | Un trainer ha molte specializzazioni, una specializzazione è di molti trainer |

**NOTA IMPORTANTE:** Le relazioni **N:1 richieste** sono soddisfatte da:
- Session → Client (molte sessioni per un cliente)
- Session → Trainer (molte sessioni per un trainer)

---

## 🌐 7. API ENDPOINTS (MVP)

### Tabella Riepilogativa dei 3 Endpoint MVP

| # | Metodo | Rotta | Descrizione | Entità Coinvolte |
|---|--------|-------|-------------|------------------|
| 1 | POST | `/api/trainers/register` | Registra un nuovo trainer | User, Trainer, Specialization |
| 2 | GET | `/api/trainers/search` | Cerca trainer con filtri | Trainer, Specialization |
| 3 | POST | `/api/sessions` | Prenota una sessione | Session, Client, Trainer |

### Dettaglio Endpoint 1: Registrazione Trainer

**Metodo:** POST  
**Rotta:** `/api/trainers/register`  
**Descrizione:** Registra un nuovo personal trainer nel sistema con informazioni professionali e specializzazioni

**Request Body:**
```json
{
  "user_id": 5,
  "bio": "Specializzato in powerlifting e allenamento funzionale",
  "hourly_rate": 35.0,
  "location": "Milano",
  "experience_years": 8,
  "specialization_ids": [1, 2]
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": {
    "id": 5,
    "email": "marco.training@email.com",
    "name": "Marco Bianchi",
    "role": "trainer"
  },
  "bio": "Specializzato in powerlifting e allenamento funzionale",
  "hourly_rate": 35.0,
  "location": "Milano",
  "experience_years": 8,
  "specializations": [
    {"id": 1, "name": "Powerlifting"},
    {"id": 2, "name": "Allenamento Funzionale"}
  ]
}
```

---

### Dettaglio Endpoint 2: Ricerca Trainer

**Metodo:** GET  
**Rotta:** `/api/trainers/search?specialization=powerlifting&location=Milano&max_price=40`  
**Descrizione:** Restituisce una lista di trainer che corrispondono ai filtri applicati

**Query Parameters:**
- `specialization` (string, optional): Filtra per specializzazione
- `location` (string, optional): Filtra per città/zona
- `max_price` (float, optional): Tariffa oraria massima

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Marco Bianchi",
    "bio": "Specializzato in powerlifting",
    "hourly_rate": 35.0,
    "location": "Milano",
    "experience_years": 8,
    "specializations": ["Powerlifting", "Functional"]
  },
  {
    "id": 3,
    "name": "Giuseppe Verdi",
    "bio": "Powerlifter agonista",
    "hourly_rate": 40.0,
    "location": "Milano",
    "experience_years": 12,
    "specializations": ["Powerlifting", "Preparazione Atletica"]
  }
]
```

---

### Dettaglio Endpoint 3: Prenotazione Sessione

**Metodo:** POST  
**Rotta:** `/api/sessions`  
**Descrizione:** Permette a un cliente di prenotare una sessione di allenamento con un trainer

**Request Body:**
```json
{
  "client_id": 10,
  "trainer_id": 1,
  "date": "2026-07-15",
  "time": "10:00",
  "notes": "Prima sessione, focus su tecnica di base"
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "client": {
    "id": 10,
    "name": "Luca Rossi"
  },
  "trainer": {
    "id": 1,
    "name": "Marco Bianchi"
  },
  "date": "2026-07-15",
  "time": "10:00",
  "status": "scheduled",
  "notes": "Prima sessione, focus su tecnica di base",
  "message": "Sessione prenotata con successo"
}
```

---

## ✅ 8. VINCOLI E VALIDAZIONI

### Validazioni sui Dati

**User:**
- Email deve essere unica e valida
- Password minimo 8 caratteri
- Role deve essere 'client' o 'trainer'

**Client:**
- user_id deve riferirsi a un User con role='client'
- fitness_level deve essere uno tra ['beginner', 'intermediate', 'advanced']

**Trainer:**
- user_id deve riferirsi a un User con role='trainer'
- hourly_rate deve essere > 0
- experience_years deve essere >= 0

**Session:**
- client_id e trainer_id devono esistere
- date deve essere futura (>= oggi)
- time deve essere in formato HH:MM
- Nessun conflitto: impossibile prenotare lo stesso trainer nello stesso slot

**Specialization:**
- name deve essere unico

---

## 📈 9. METRICHE DI SUCCESSO

### KPI del Progetto

| Metrica | Target MVP | Target Anno 1 |
|---------|------------|---------------|
| Trainer registrati | 50+ | 500+ |
| Clienti registrati | 200+ | 2000+ |
| Sessioni prenotate/mese | 500+ | 5000+ |
| Tasso di completamento sessioni | >85% | >90% |
| Valutazione media trainer | - | >4.2/5 |

---

## 🎯 10. CONCLUSIONI

FitConnect rappresenta una soluzione completa ed efficace per connettere personal trainer e clienti, risolvendo i principali pain point di entrambi i segmenti. 

**Punti di forza:**
- Modello dati robusto con relazioni ben definite (inclusa la relazione N:1 richiesta)
- MVP focalizzato sulle funzionalità core
- API ben progettate e documentate
- Scalabilità per future features

**Prossimi passi:**
1. Implementazione backend con FastAPI
2. Sviluppo database PostgreSQL
3. Testing e validazione
4. Deploy MVP
5. Raccolta feedback utenti
6. Iterazione e miglioramento continuo

---

**Documento redatto:** Marzo 2026  
**Versione:** 1.0  
**Autore:** FitConnect Team
