#!/bin/bash

# FitConnect - Avvio completo (Frontend + Backend paralleli)

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║  🚀 FitConnect - Avvio Completo                    ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Cleanup: arresta tutto quando Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arresto servizi...${NC}"
    # Arresta tutti i processi child
    jobs -p | xargs -r kill 2>/dev/null || true
    sleep 1
    exit 0
}

trap cleanup SIGINT SIGTERM

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}📍 Root: $SCRIPT_DIR${NC}"
echo ""

# ============================================================================
# VENV SETUP
# ============================================================================

echo -e "${BLUE}[1/5] Setup Virtual Environment${NC}"
echo "════════════════════════════════════════════════════"
echo ""

VENV_PATH="$SCRIPT_DIR/.venv"

if [ -d "$VENV_PATH" ] && [ ! -f "$VENV_PATH/bin/activate" ]; then
    echo -e "${YELLOW}⚠️  Venv corrotto, eliminazione...${NC}"
    rm -rf "$VENV_PATH"
fi

if [ ! -d "$VENV_PATH" ]; then
    echo "📌 Creazione venv..."
    python3 -m venv "$VENV_PATH" || { echo "❌ Errore creazione venv"; exit 1; }
    echo "✅ Venv creato"
else
    echo "✅ Venv trovato"
fi

source "$VENV_PATH/bin/activate"
echo "✅ Venv attivato"
echo ""

# ============================================================================
# BACKEND SETUP
# ============================================================================

echo -e "${BLUE}[2/5] Setup Backend${NC}"
echo "════════════════════════════════════════════════════"
echo ""

cd "$SCRIPT_DIR/backend"

echo "📌 Pip upgrade..."
pip install --upgrade pip setuptools wheel -q

if ! python3 -c "import fastapi, sqlalchemy, pydantic" 2>/dev/null; then
    echo "📌 Installazione dipendenze backend..."
    pip install -q -r requirements.txt || { echo "❌ Errore installi backend"; exit 1; }
    echo "✅ Dipendenze backend installate"
else
    echo "✅ Dipendenze backend OK"
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ .env creato"
fi

echo ""
echo -e "${GREEN}✅ Backend pronto!${NC}"
echo ""

# ============================================================================
# FRONTEND SETUP
# ============================================================================

echo -e "${BLUE}[3/5] Setup Frontend${NC}"
echo "════════════════════════════════════════════════════"
echo ""

cd "$SCRIPT_DIR/frontend"

if command -v node &>/dev/null && command -v npm &>/dev/null; then
    echo "✅ Node.js: $(node --version)"
    echo "✅ npm: $(npm --version)"
    
    if [ ! -d "node_modules" ]; then
        echo "📌 Installazione dipendenze frontend..."
        npm install -q || { echo "❌ Errore installi frontend"; exit 1; }
        echo "✅ Dipendenze frontend installate"
    else
        echo "✅ Dipendenze frontend OK"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Frontend pronto!${NC}"
    FRONTEND_AVAILABLE=1
else
    echo -e "${YELLOW}⚠️  Node.js non trovato - frontend non disponibile${NC}"
    FRONTEND_AVAILABLE=0
fi

echo ""

# ============================================================================
# VERIFICA PORTE
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

if check_port 8080; then
    echo -e "${YELLOW}⚠️  Porta 8080 già in uso!${NC}"
    echo "   Arresta il vecchio processo o usa un'altra porta"
    exit 1
else
    echo "✅ Porta 8080 disponibile"
fi

if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    if check_port 5173; then
        echo -e "${YELLOW}⚠️  Porta 5173 già in uso!${NC}"
        exit 1
    else
        echo "✅ Porta 5173 disponibile"
    fi
fi

echo ""

# ============================================================================
# AVVIO SERVIZI
# ============================================================================

echo -e "${BLUE}[5/5] Avvio Servizi${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Avviamento in corso...${NC}"
echo ""

# Backend
echo -e "${CYAN}🚀 Backend in avvio...${NC}"
cd "$SCRIPT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
sleep 2

# Frontend
if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    echo -e "${CYAN}🚀 Frontend in avvio...${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    sleep 2
fi

echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Servizi avviati!${NC}"
echo ""
echo -e "${YELLOW}📍 Accesso:${NC}"
echo -e "   ${CYAN}Backend:${NC}  http://localhost:8080"
echo -e "   ${CYAN}Docs:${NC}     http://localhost:8080/docs"
echo -e "   ${CYAN}Frontend:${NC} http://localhost:5173"
echo ""
echo "🔐 Test Login:"
echo "   Email:    admin@fitconnect.com"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}📝 Comandi:${NC}"
echo "   Arrestare:     Ctrl+C"
echo "   Backend log:   tail -f backend.log"
if [ $FRONTEND_AVAILABLE -eq 1 ]; then
    echo "   Frontend log:  tail -f frontend.log"
fi
echo ""
echo "════════════════════════════════════════════════════"
echo ""

# Attendi che uno dei processi finisca
wait