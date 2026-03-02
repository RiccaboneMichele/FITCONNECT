#!/bin/bash
# Script per installare le dipendenze FitConnect

echo "🚀 FitConnect - Installazione dipendenze"
echo "========================================"

# Verifica se esiste già un venv
if [ -d ".venv" ]; then
    echo "✓ Virtual environment già esistente (.venv)"
else
    echo "📦 Creazione virtual environment..."
    python3 -m venv .venv
fi

# Attiva il venv
echo "🔧 Attivazione virtual environment..."
source .venv/bin/activate

# Installa dipendenze minime (solo quelle necessarie per il progetto dimostrativo)
echo "📥 Installazione dipendenze..."
pip install --upgrade pip
pip install fastapi uvicorn "pydantic[email]"

echo ""
echo "✅ Installazione completata!"
echo ""
echo "Per avviare il progetto:"
echo "  1. source .venv/bin/activate"
echo "  2. ./start.sh"
echo ""
echo "Oppure direttamente: ./start.sh"
