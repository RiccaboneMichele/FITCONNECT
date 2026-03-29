#!/bin/bash

set -e  # Esci se c'è un errore

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script di riorganizzazione progetto FitConnect
# Organizza file in cartelle logiche e elimina duplicati

echo -e "${YELLOW}🗂️  Riorganizzazione progetto FitConnect...${NC}"
echo ""

# Salva la posizione corrente
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Crea struttura cartelle
echo -e "${YELLOW}📁 Creazione struttura cartelle...${NC}"
mkdir -p backend
mkdir -p frontend
mkdir -p docs

# 2. Sposta file backend se sono nella root
echo -e "${YELLOW}📦 Spostamento file backend...${NC}"
for file in auth.py crud.py database.py models.py schemas.py requirements.txt .env.example main_with_db.py; do
    if [ -f "$file" ] && [ ! -f "backend/$file" ]; then
        if [ "$file" = "main_with_db.py" ]; then
            mv "$file" backend/main.py
            echo "  ✓ Spostato $file → backend/main.py"
        else
            mv "$file" backend/
            echo "  ✓ Spostato $file → backend/"
        fi
    elif [ -f "backend/$file" ]; then
        echo "  ℹ $file già in backend/"
    fi
done

# Se main.py è nella root, presumibilmente è quello vecchio
if [ -f "main.py" ]; then
    echo -e "${RED}  ⚠ Trovato main.py in root (versione vecchia) - eliminato${NC}"
    rm -f main.py
fi

# Copia .env in backend se esiste nella root
if [ -f ".env" ] && [ ! -f "backend/.env" ]; then
    cp .env backend/.env
    echo "  ✓ Copiato .env → backend/"
fi

# 3. Sposta documentazione
echo -e "${YELLOW}📚 Spostamento documentazione...${NC}"
for file in compito1_analisi.md api_documentation.md diagramma_uml_completo.txt examples_api.json README_PROGETTO.md CHECKLIST_PROGETTO.md ESEMPI_UTILIZZO.md AVVIO_PROGETTO.md; do
    if [ -f "$file" ] && [ ! -f "docs/$file" ]; then
        mv "$file" docs/
        echo "  ✓ Spostato $file → docs/"
    elif [ -f "docs/$file" ]; then
        echo "  ℹ $file già in docs/"
    fi
done

# 4. Elimina file obsoleti/duplicati
echo -e "${YELLOW}🗑️  Eliminazione file obsoleti...${NC}"
files_to_remove=(
    "examples.json"              # Duplicato di examples_api.json
    "install.sh"                 # Script vecchio
    "start_fullstack.sh"         # Rimpiazzato
    "docs/diagramma_uml.txt"     # Versione vecchia
    "docs/presentazione.md"      # File vecchio
    "backend.log"                # Log temporanei
    "frontend.log"               # Log temporanei
    "fitconnect.db"              # Database verrà ricreato
)

for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "  ${RED}✓ Eliminato $file${NC}"
    fi
done

# 5. Pulisci cache Python
echo -e "${YELLOW}🧹 Pulizia cache Python...${NC}"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
echo "  ✓ Cache Python pulito"

# 6. Crea/Aggiorna .gitignore
echo -e "${YELLOW}📝 Configurazione .gitignore...${NC}"
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
env/
*.egg-info/
dist/
build/
.pytest_cache/

# Database
*.db
*.sqlite
*.sqlite3

# Environment
.env
backend/.env

# Logs
*.log
logs/
backend/*.log
frontend/*.log

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-workspace

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.vite/
frontend/.cache/
frontend/package-lock.json

# OS
.DS_Store
Thumbs.db

# Temp files
*.tmp
tmp/

EOF
    echo "  ✓ Creato .gitignore"
else
    echo "  ℹ .gitignore già esiste"
fi


# 7. Verifica struttura
echo ""
echo -e "${GREEN}✅ Riorganizzazione completata!${NC}"
echo ""
echo -e "${YELLOW}📁 Struttura finale del progetto:${NC}"
echo "FITCONNECT/"
echo "├── backend/              ← Codice backend Python"
echo "│   ├── main.py"
echo "│   ├── database.py"
echo "│   ├── models.py"
echo "│   ├── schemas.py"
echo "│   ├── crud.py"
echo "│   ├── auth.py"
echo "│   ├── requirements.txt"
echo "│   └── __pycache__/"
echo "│"
echo "├── frontend/             ← Applicazione React Vite"
echo "│   ├── src/"
echo "│   ├── package.json"
echo "│   └── node_modules/"
echo "│"
echo "├── docs/                 ← Documentazione progetto"
echo "│   ├── api_documentation.md"
echo "│   ├── README_PROGETTO.md"
echo "│   ├── diagramma_uml_completo.txt"
echo "│   ├── ESEMPI_UTILIZZO.md"
echo "│   ├── AVVIO_PROGETTO.md"
echo "│   └── CHECKLIST_PROGETTO.md"
echo "│"
echo "├── .env                  ← Variabili di ambiente"
echo "├── .gitignore            ← Git ignore rules"
echo "├── README.md             ← README principale"
echo "└── reorganize_project.sh ← Questo script"
echo ""
echo -e "${GREEN}🚀 Prossimi passi:${NC}"
echo "   1. Vai nella cartella backend: cd backend"
echo "   2. Installa dipendenze Python: pip install -r requirements.txt"
echo "   3. Configura .env in backend/"
echo "   4. Torna alla root: cd .."
echo "   5. Vai nella cartella frontend: cd frontend" 
echo "   6. Installa dipendenze Node: npm install"
echo "   7. Torna alla root: cd .."
echo "   8. Avvia il progetto (da valutare come)"
echo ""
echo -e "${YELLOW}📖 Per leggere la documentazione:${NC}"
echo "   - Analisi del progetto: docs/compito1_analisi.md"
echo "   - Documentazione API: docs/api_documentation.md"
echo "   - Esempi di utilizzo: docs/ESEMPI_UTILIZZO.md"
echo "   - Checklist progetto: docs/CHECKLIST_PROGETTO.md"
echo ""
