#!/bin/bash
# Script veloce per ripulire e migrare il database

cd /workspaces/FITCONNECT/backend

echo "🔄 Eliminazione database vecchio..."
rm -f fitconnect.db

echo "📦 Ricreazione del database con schema aggiornato..."
python3 << 'EOF'
import os
import sys
sys.path.insert(0, os.getcwd())

from database import Base, engine, create_sample_data

print("✅ Creazione tabelle...")
Base.metadata.create_all(bind=engine)

print("✅ Inserimento dati di esempio...")
create_sample_data()

print("\n✨ Database pronto!")
EOF

echo ""
echo "🚀 Riavvia il server con: ./start.sh"
