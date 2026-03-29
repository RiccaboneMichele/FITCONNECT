#!/usr/bin/env python3
"""
Script semplice per resettare e ricreate il database con i nuovi dati di esempio
"""
import os
import sys

# Aggiungi la cartella backend al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine, create_sample_data, SessionLocal
from models import User

def reset_database():
    """Resetta il database e ricrea i dati di esempio"""
    print("🔄 Reset Database FitConnect")
    print("=" * 60)
    
    # Controllare se ci sono dati esistenti
    db = SessionLocal()
    user_count = db.query(User).count()
    db.close()
    
    print(f"   Utenti attualmente nel database: {user_count}")
    
    if user_count > 0:
        print("   ⚠️  Eliminazione tabelle esistenti...")
        Base.metadata.drop_all(bind=engine)
    
    print("   📦 Creazione nuove tabelle...")
    Base.metadata.create_all(bind=engine)
    
    print("   📥 Inserimento dati di esempio...")
    create_sample_data()
    
    print("\n✅ Database resetato con successo!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        reset_database()
    except Exception as e:
        print(f"\n❌ Errore: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
