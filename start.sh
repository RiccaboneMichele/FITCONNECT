#!/bin/bash
# Script per avviare il server FitConnect

echo "🚀 FitConnect - Avvio server FastAPI"
echo "====================================="

# Controlla se esiste il venv
if [ ! -d ".venv" ]; then
    echo "⚠️  Virtual environment non trovato!"
    echo "Esegui prima: ./install.sh"
    exit 1
fi

# Attiva il venv
source .venv/bin/activate

# Verifica se uvicorn è installato
if ! command -v uvicorn &> /dev/null; then
    echo "⚠️  uvicorn non installato!"
    echo "Esegui prima: ./install.sh"
    exit 1
fi

echo ""
echo "✅ Avvio server su http://localhost:8080"
echo "📖 Documentazione interattiva: http://localhost:8080/docs"
echo "📊 Alternativa ReDoc: http://localhost:8080/redoc"
echo ""
echo "Premi CTRL+C per fermare il server"
echo ""

# Avvia uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8080
