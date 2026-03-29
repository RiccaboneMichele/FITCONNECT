#!/bin/bash

# ============================================================================
# FitConnect - All-in-One Startup Script
# Lancia backend + frontend in una singola finestra
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║   🚀 FitConnect - Avviamento Completo                              ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colori ANSI
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Funzione cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🛑 Arresto servizi in corso...${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════════${NC}"
    
    # Arresta tutti i background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    sleep 1
    exit 0
}

# Cattura Ctrl+C
trap cleanup SIGINT SIGTERM

# Directory del progetto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📍 Directory progetto: $SCRIPT_DIR${NC}"
echo ""

# ============================================================================
# 1. SETUP VIRTUAL ENVIRONMENT
# ============================================================================

echo -e "${BLUE}[1/5] Setup Virtual Environment${NC}"
echo "════════════════════════════════════════════════════"
echo ""

VENV_PATH="$SCRIPT_DIR/.venv"

# Controlla se venv è corrotto
if [ -d "$VENV_PATH" ] && [ ! -f "$VENV_PATH/bin/activate" ]; then
    echo -e "${YELLOW}⚠️  Venv corrotto, eliminazione...${NC}"
    rm -rf "$VENV_PATH"
fi

# Crea venv se non esiste
if [ ! -d "$VENV_PATH" ]; then
    echo "📌 Creazione Virtual Environment..."
    if ! python3 -m venv "$VENV_PATH"; then
        echo -e "${RED}❌ ERRORE: Impossibile creare venv${NC}"
        echo "   Assicurati che python3 sia installato"
        exit 1
    fi
    echo "✅ Virtual Environment creato"
else
    echo "✅ Virtual Environment trovato"
fi

# Attiva venv
source "$VENV_PATH/bin/activate"
echo "✅ Virtual Environment attivato"
echo ""

# ============================================================================
# 2. SETUP BACKEND
# ============================================================================

echo -e "${BLUE}[2/5] Setup Backend (FastAPI)${NC}"
echo "════════════════════════════════════════════════════"
echo ""

cd "$SCRIPT_DIR/backend"

echo "📌 Aggiornamento pip..."
pip install --upgrade pip setuptools wheel -q

# Verifica se dipendenze sono già installate
if ! python3 -c "import fastapi, sqlalchemy, pydantic, uvicorn" 2>/dev/null; then
    echo "📌 Installazione dipendenze Backend..."
    if ! pip install -q -r requirements.txt; then
        echo -e "${RED}❌ ERRORE: Installazione dipendenze fallita${NC}"
        echo "   Prova: pip install -r backend/requirements.txt (manualmente)"
        exit 1
    fi
    echo "✅ Dipendenze Backend installate"
else
    echo "✅ Dipendenze Backend OK"
fi

# Crea .env da .env.example
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ File .env creato"
fi

echo ""
echo -e "${GREEN}✅ Backend pronto!${NC}"
echo ""

# ============================================================================
# 3. SETUP FRONTEND
# ============================================================================

echo -e "${BLUE}[3/5] Setup Frontend (React + Vite)${NC}"
echo "════════════════════════════════════════════════════"
echo ""

cd "$SCRIPT_DIR/frontend"

FRONTEND_AVAILABLE=0

if ! command -v node &>/dev/null; then
    echo -e "${YELLOW}⚠️  Node.js non trovato${NC}"
    echo "   Installa da: https://nodejs.org/"
    echo "   O su Ubuntu: sudo apt install nodejs npm"
    echo ""
    FRONTEND_AVAILABLE=0
else
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
    echo ""
    
    # Verifica se dipendenze sono installate
    if [ ! -d "node_modules" ]; then
        echo "📌 Installazione dipendenze Frontend..."
        if ! npm install -q; then
            echo -e "${RED}❌ ERRORE: npm install fallito${NC}"
            echo "   Prova manualmente: cd frontend && npm install"
            exit 1
        fi
        echo "✅ Dipendenze Frontend installate"
    else
        echo "✅ Dipendenze Frontend OK"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Frontend pronto!${NC}"
    FRONTEND_AVAILABLE=1
fi

echo ""

# ============================================================================
# 4. VERIFICA PORTE
# ============================================================================

echo -e "${BLUE}[4/5] Verifica Porte${NC}"
echo "════════════════════════════════════════════════════"
echo ""

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Backend porta 8080
if check_port 8080; then
    echo -e "${RED}❌ Porta 8080 è in uso!${NC}"
    echo "   Arresta il processo: lsof -i :8080"
    exit 1
else
    echo "✅ Porta 8080 disponibile (Backend)"
fi

# Frontend porta 5173
if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    if check_port 5173; then
        echo -e "${RED}❌ Porta 5173 è in uso!${NC}"
        echo "   Arresta il processo: lsof -i :5173"
        exit 1
    else
        echo "✅ Porta 5173 disponibile (Frontend)"
    fi
fi

echo ""

# ============================================================================
# 5. AVVIO SERVIZI
# ============================================================================

echo -e "${BLUE}[5/5] Avvio Servizi${NC}"
echo "════════════════════════════════════════════════════"
echo ""

# Cancella log precedenti
rm -f "$SCRIPT_DIR/backend.log" "$SCRIPT_DIR/frontend.log"

# Avvia Backend
echo -e "${CYAN}📌 Avvio Backend...${NC}"
cd "$SCRIPT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload \
    > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 2

# Avvia Frontend (se disponibile)
if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    echo -e "${CYAN}📌 Avvio Frontend...${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    sleep 2
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ TUTTI I SERVIZI AVVIATI!${NC}"
echo ""

# Dashboard di stato
echo -e "${YELLOW}📍 ACCESSO:${NC}"
echo ""
echo -e "  ${CYAN}🌐 Homepage Backend${NC}:  http://localhost:8080"
echo -e "  ${CYAN}📖 Swagger Docs${NC}:      http://localhost:8080/docs"
echo -e "  ${CYAN}🔄 ReDoc${NC}:             http://localhost:8080/redoc"

if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    echo ""
    echo -e "  ${CYAN}🎨 Frontend React${NC}:    http://localhost:5173"
fi

echo ""
echo -e "${YELLOW}🔐 CREDENZIALI DI DEFAULT:${NC}"
echo ""
echo "  Admin:"
echo "    Email:    admin@fitconnect.com"
echo "    Password: admin123"
echo ""
echo "  Trainer:"
echo "    Email:    marco.trainer@fitconnect.com"
echo "    Password: trainer123"
echo ""
echo "  Client:"
echo "    Email:    luca.client@fitconnect.com"
echo "    Password: client123"
echo ""

echo -e "${YELLOW}📝 COMANDI UTILI:${NC}"
echo ""
echo "  Arrestare servizi:    Premi Ctrl+C"
echo "  Visualizza log:       tail -f backend.log"
if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    echo "  Frontend log:         tail -f frontend.log"
fi
echo ""

echo "════════════════════════════════════════════════════════════════════"
echo ""

# Attendi termination
wait
