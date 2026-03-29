#!/bin/bash

# Script veloce per resettare il database

echo ""
echo "🔄 Reset Database FitConnect"
echo "============================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Attiva venv se esiste
if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

# Vai a backend
cd backend

echo "📌 Eliminazione database esistente..."
if [ -f "fitconnect.db" ]; then
    rm -f fitconnect.db
    echo "✅ Database eliminato"
else
    echo "ℹ️  Nessun database esistente"
fi

echo ""
echo "📦 Il database verrà ricreato al prossimo avvio del backend"
echo ""
echo "🚀 Avvia il backend con: ./dev.sh"
echo ""
echo "🔐 Credenziali di default:"
echo ""
echo "   Admin:   admin@fitconnect.com / admin123"
echo "   Trainer: marco.trainer@fitconnect.com / trainer123"
echo "   Client:  luca.client@fitconnect.com / client123"
echo ""
