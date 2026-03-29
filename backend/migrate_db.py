#!/usr/bin/env python3
"""
Script per pulire il database e ricrearlo con i nuovi schema
Esegui questo prima di riavviare il server
"""
import os
import sys

# Posizionati nella cartella backend
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Cambia dir
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("🔄 Pulizia Database FitConnect")
print("=" * 60)

# Rimuovi il file database SQLite vecchio
db_file = "fitconnect.db"
if os.path.exists(db_file):
    try:
        os.remove(db_file)
        print(f"✅ File {db_file} eliminato")
    except Exception as e:
        print(f"❌ Errore eliminazione: {e}")
        sys.exit(1)

print("\n📦 Ricreazione database con nuove colonne...")
print("=" * 60)

try:
    from database import Base, engine, create_sample_data
    
    # Ricrea tutte le tabelle
    print("📋 Creazione tabelle...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelle create")
    
    # Popola con dati di esempio
    print("📥 Inserimento dati di esempio...")
    create_sample_data()
    print("✅ Dati di esempio inseriti")
    
    print("\n" + "=" * 60)
    print("✨ Database pronto!")
    print("=" * 60)
    print("\n🚀 Riavvia il server backend per vedasi i dati.")
    
except Exception as e:
    print(f"\n❌ Errore: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
