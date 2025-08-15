#!/bin/bash
# Script para iniciar o Sistema Ki Aikido

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🥋 Iniciando Sistema Ki Aikido..."

# Verificar se o ambiente virtual existe
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "❌ Ambiente virtual não encontrado. Execute ./scripts/install.sh primeiro."
    exit 1
fi

# Limpeza robusta de processos antigos
echo "🔄 Limpando processos antigos..."

# Matar processos Python do sistema Ki Aikido
pkill -f "python.*main.py" 2>/dev/null && echo "🔧 Processos Python antigos finalizados"

# Matar processos na porta 5000
PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "🛑 Finalizando processos na porta 5000: $PIDS"
    echo $PIDS | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Verificar se a porta está livre
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "⚠️  Porta 5000 ainda ocupada. Aguardando..."
    sleep 3
    
    # Tentativa final de limpeza
    PIDS=$(lsof -ti:5000 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "🔧 Forçando finalização: $PIDS"
        echo $PIDS | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Verificar se o banco de dados existe
if [ ! -f "$BACKEND_DIR/src/database/app.db" ]; then
    echo "⚠️  Banco de dados não encontrado. Inicializando..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    python3 -c "
import sys
sys.path.append('.')
from src.main import app
from src.models import init_db
with app.app_context():
    init_db()
    print('✅ Banco de dados inicializado!')
"
fi

# Iniciar backend
cd "$BACKEND_DIR"
source venv/bin/activate

echo ""
echo "🚀 Iniciando servidor backend..."
echo "🌐 URL da API: http://localhost:5000"
echo "📱 Frontend: file://$PROJECT_DIR/frontend/ki-aikido-enhanced.html"
echo ""
echo "🔑 Credenciais de teste:"
echo "   admin@kiaikido.com / 123456 (Administrador)"
echo "   florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)"
echo ""
echo "⏹️  Para parar o servidor, pressione Ctrl+C"
echo "📊 Para verificar status: ./status.sh"
echo ""

# Iniciar servidor
python3 src/main.py

