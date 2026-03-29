#!/usr/bin/env python3
"""
Script per resettare il database e ricreare i dati di esempio
Usa questo se gli utenti di default non esistono
"""

import os
import sys

# Aggiungi backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("🔄 Reset Database FitConnect")
print("=" * 60)
print()

# Cambia directory a backend
os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

# Importa moduli
from database import Base, engine, create_sample_data, SessionLocal
from models import User

print("📌 Controllo database attuale...")
db = SessionLocal()
user_count = db.query(User).count()
print(f"   Utenti esistenti: {user_count}")
db.close()

if user_count > 0:
    print()
    response = input("⚠️  Il database contiene già dati. Vuoi eliminare tutto? (sì/no): ")
    if response.lower() not in ['sì', 'si', 'yes', 'y', 's']:
        print("❌ Operazione annullata")
        sys.exit(0)

print()
print("🗑️  Eliminazione database...")

# Rimuovi il file database SQLite
db_file = "fitconnect.db"
if os.path.exists(db_file):
    os.remove(db_file)
    print(f"   ✅ File {db_file} eliminato")

print()
print("📦 Creazione nuove tabelle...")

# Ricrea le tabelle
Base.metadata.create_all(bind=engine)
print("   ✅ Tabelle create")

print()
print("👥 Creazione utenti di default...")

# Crea dati di esempio
create_sample_data()

print()
print("=" * 60)
print("✅ Database resettato con successo!")
print()
print("🔐 Credenziali disponibili:")
print()
print("   Admin:")
print("     Email:    admin@fitconnect.com")
print("     Password: admin123")
print()
print("   Trainer:")
print("     Email:    marco.trainer@fitconnect.com")
print("     Password: trainer123")
print()
print("   Client:")
print("     Email:    luca.client@fitconnect.com")
print("     Password: client123")
print()
print("=" * 60)
