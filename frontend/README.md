# FitConnect - Frontend React + Vite

Interfaccia grafica completa per FitConnect con:
- Autenticazione (Login/Register)
- Dashboard Admin con statistiche
- Gestione Clienti e Trainer
- Booking sessioni
- Sistema permessi

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

L'app sarà disponibile su http://localhost:5173

## 📁 Struttura

```
frontend/
├── public/              # Assets statici
├── src/
│   ├── components/      # Componenti riutilizzabili
│   │   ├── auth/       # Login, Register
│   │   ├── dashboard/  # Dashboard Admin/Trainer/Client
│   │   ├── trainers/   # Ricerca, lista, dettaglio trainer
│   │   ├── sessions/   # Booking, lista sessioni
│   │   └── common/     # Layout, Navbar, Footer
│   ├── services/       # API client (axios)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utilities
│   ├── App.jsx         # Router principale
│   └── main.jsx        # Entry point
├── package.json
└── vite.config.js
```

## 🔧 Tecnologie

- **React 18** - UI framework
- **Vite** - Build tool veloce
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling utility-first
- **React Query** - Data fetching e caching
- **Zustand** - State management leggero

## 🎨 Features

### Autenticazione
- Login con JWT
- Registrazione per Client e Trainer
- Protezione route private
- Logout

### Dashboard Admin
- Statistiche utenti, sessioni, revenue
- Gestione utenti (CRUD)
- Visualizzazione contatti
- Sistema permessi e gruppi

### Trainer
- Ricerca avanzata (location, specializzazione, prezzo)
- Filtri dinamici
- Dettaglio profilo con recensioni
- Prenotazione sessione

### Client
- Lista sessioni prenotate
- Cancellazione sessione
- Gestione profilo
- Cronologia allenamenti

### Pannello Trainer
- Calendario disponibilità
- Lista prenotazioni
- Modifica sessioni
- Statistiche personali

## 📝 Configurazione

Crea `.env` nella cartella frontend:

```env
VITE_API_URL=http://localhost:8080/api
```

## 🔐 Ruoli e Permessi

Il frontend gestisce 3 ruoli:
- **Admin**: Accesso completo, dashboard admin
- **Trainer**: Gestione proprie sessioni, profilo
- **Client**: Prenotazioni, visualizzazione trainer

## 🚀 Build Produzione

```bash
npm run build
npm run preview  # Test build produzione
```

## 📦 Deploy

I file statici saranno in `dist/` dopo il build.
Deploy su Vercel, Netlify, o qualsiasi hosting statico.
