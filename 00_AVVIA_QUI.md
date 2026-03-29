# 🚀 FitConnect - Avvio Rapido

## ⚡ Per Iniziare (Una Sola Linea!)

```bash
chmod +x dev.sh && ./dev.sh
```

Tutto fatto! Lo script:
- ✅ Crea virtual environment Python
- ✅ Installa dipendenze backend (FastAPI)
- ✅ Installa dipendenze frontend (React)
- ✅ Lancia backend su **http://localhost:8080**
- ✅ Lancia frontend su **http://localhost:5173**

---

## 📍 URLs di Accesso

| Servizio | URL |
|----------|-----|
| **Applicazione** | http://localhost:5173 |
| **API Base** | http://localhost:8080 |
| **Swagger Docs** | http://localhost:8080/docs |
| **ReDoc** | http://localhost:8080/redoc |

---

## 🔐 Login Test

Usa una di queste credenziali:

```
Admin:
  Email:    admin@fitconnect.com
  Password: admin123

Trainer:
  Email:    marco.trainer@fitconnect.com
  Password: trainer123

Client:
  Email:    luca.client@fitconnect.com
  Password: client123
```

---

## ⏹️ Arrestare

Premi **Ctrl+C** nel terminale dove lanci lo script.

---

## 🔧 Se Qualcosa Non Funziona

### ❌ "Credenziali non funzionano / Database vuoto"

Il database potrebbe essere corrotto o vuoto. **Resettalo**:

```bash
chmod +x reset.sh
./reset.sh
```

Poi riavvia con `./dev.sh`

### ❌ "Port already in use"
Qualcosa usa la porta 8080 o 5173:
```bash
# Trova il processo:
lsof -i :8080
lsof -i :5173

# Arresta:
kill -9 <PID>
```

### ❌ "Node.js not found"
```bash
# Ubuntu/Debian:
sudo apt install nodejs npm

# Oppure scarica da: https://nodejs.org/
```

### ❌ "Python not found"
```bash
# Ubuntu/Debian:
sudo apt install python3 python3-pip python3-venv
```

### ❌ Errore di dipendenze
```bash
# Manuale:
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

---

## 📁 Struttura

```
FITCONNECT/
├── dev.sh                 ← Questo script! 🎯
├── backend/               ← FastAPI + SQLAlchemy
├── frontend/              ← React + Vite
└── docs/                  ← Documentazione
```

---

## 📚 Documentazione Completa

- [API Documentation](docs/api_documentation.md)
- [Guida Progetto](docs/README_PROGETTO.md)
- [Esempie d'Uso](docs/ESEMPI_UTILIZZO.md)
- [Analisi Completa](docs/compito1_analisi.md)

---

**✅ Tutto pronto! Basta lanciare `./dev.sh` e inizia lo sviluppo!** 🎉
