#!/usr/bin/env python3
"""
Test script per diagnosticare problemi di importazione nel backend FitConnect
"""

import sys
import os

# Aggiungi backend al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("🔍 Test Importazioni Backend FitConnect")
print("=" * 50)
print()

# Test 1: Packages system
print("1️⃣  Testing system packages...")
system_packages = ['fastapi', 'sqlalchemy', 'pydantic', 'uvicorn', 'jwt', 'passlib']
for pkg in system_packages:
    try:
        __import__(pkg)
        print(f"   ✅ {pkg}")
    except ImportError as e:
        print(f"   ❌ {pkg}: {e}")
        sys.exit(1)

print()

# Test 2: Local modules da backend/
print("2️⃣  Testing local modules (backend/)...")
local_modules = ['database', 'models', 'schemas', 'crud', 'auth']

os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))

for mod in local_modules:
    try:
        exec(f"import {mod}")
        print(f"   ✅ {mod}")
    except Exception as e:
        print(f"   ❌ {mod}: {e}")
        sys.exit(1)

print()

# Test 3: Main app
print("3️⃣  Testing main application...")
try:
    from main import app
    print(f"   ✅ FastAPI app loaded")
    print(f"   📝 App title: {app.title}")
    print(f"   📝 App version: {app.version}")
except Exception as e:
    print(f"   ❌ main.py: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("✅ Tutti i test passati!")
print()
print("🚀 Puoi avviare il backend con:")
print("   cd backend && python3 -m uvicorn main:app --reload")
