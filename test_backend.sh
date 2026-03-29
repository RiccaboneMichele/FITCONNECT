#!/bin/bash

# Script di test per il backend FitConnect
# Verifica dipendenze, setup venv e avvia il server

set -e  # Esci se c'è un errore

echo "🔍 Test Backend FitConnect"
echo "============================"
echo ""

cd backend

# 1. Verifica Python
echo "📌 Verifica Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 non trovato"
    exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python3 trovato: $PYTHON_VERSION"
echo ""

# 2. Crea virtualenv
echo "📌 Setup Virtual Environment..."
if [ ! -d ".venv" ]; then
    echo "  Creazione .venv..."
    python3 -m venv .venv
else
    echo "  .venv già esiste"
fi
source .venv/bin/activate
echo "✅ Virtual environment attivato"
echo ""

# 3. Upgrade pip
echo "📌 Aggiornamento pip..."
pip install --upgrade pip setuptools wheel -q
echo "✅ pip aggiornato"
echo ""

# 4. Installa dipendenze
echo "📌 Installazione dipendenze da requirements.txt..."
if pip install -r requirements.txt 2>&1 | tee /tmp/pip_install.log | grep -q "ERROR\|error"; then
    echo ""
    echo "❌ Errore nell'installazione delle dipendenze:"
    grep -i "error" /tmp/pip_install.log || true
    exit 1
fi
echo "✅ Dipendenze installate"
echo ""

# 5. Crea .env se non esiste
echo "📌 Configurazione .env..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env creato da .env.example"
    else
        cat > .env << 'EOF'
# Database
DATABASE_URL=sqlite:///./fitconnect.db
# DATABASE_URL=postgresql://user:password@localhost:5432/fitconnect

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production-12345678

# CORS
FRONTEND_URL=http://localhost:3000
VITE_URL=http://localhost:5173

# Environment
ENVIRONMENT=development
EOF
        echo "✅ .env creato con configurazione base"
    fi
else
    echo "✅ .env già esiste"
fi
echo ""

# 6. Verifica importazioni
echo "📌 Verifica importazioni Python..."
python3 -c "
import sys
try:
    import fastapi
    print('  ✅ fastapi')
    import sqlalchemy
    print('  ✅ sqlalchemy')
    import pydantic
    print('  ✅ pydantic')
    import uvicorn
    print('  ✅ uvicorn')
    import jwt
    print('  ✅ jwt')
    import passlib
    print('  ✅ passlib')
except ImportError as e:
    print(f'  ❌ Errore: {e}')
    sys.exit(1)
"
echo "✅ Tutti i package critici trovati"
echo ""

# 7. Verifica file Python locali
echo "📌 Verifica file locali..."
for file in main.py database.py models.py schemas.py crud.py auth.py; do
    if [ -f "$file" ]; then
        python3 -m py_compile "$file" 2>/dev/null && echo "  ✅ $file" || (echo "  ❌ $file - errore di sintassi"; exit 1)
    else
        echo "  ❌ $file - NON TROVATO"
        exit 1
    fi
done
echo ""

# 8. Avvia il server
echo "📌 Avvio backend FastAPI..."
echo ""
echo "   🌐 API disponibile su: http://localhost:8080"
echo "   📖 Documentazione su: http://localhost:8080/docs"
echo ""
echo "   Per arrestare: Ctrl+C"
echo ""

deactivate
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
