#!/bin/bash
# Script para atualizar o Sistema Ki Aikido via Git

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🔄 Atualizando Sistema Ki Aikido..."

# Parar sistema se estiver rodando
./stop.sh

# Fazer backup do banco de dados
if [ -f "$BACKEND_DIR/database/app.db" ]; then
    echo "💾 Fazendo backup do banco de dados..."
    cp "$BACKEND_DIR/database/app.db" "$BACKEND_DIR/database/app.db.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Atualizar código via Git
echo "📥 Baixando atualizações..."
git pull origin main

# Atualizar dependências Python
echo "📦 Atualizando dependências..."
cd "$BACKEND_DIR"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Aplicar migrações de banco se necessário
echo "🗄️  Verificando banco de dados..."
python3 -c "
import sys
sys.path.append('.')
from src.main import app
from src.models import db
with app.app_context():
    db.create_all()
print('Banco de dados atualizado!')
"

echo "✅ Sistema atualizado com sucesso!"
echo "🚀 Execute ./start.sh para iniciar o sistema."
