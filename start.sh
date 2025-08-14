#!/bin/bash
# Script para iniciar o Sistema Ki Aikido

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🥋 Iniciando Sistema Ki Aikido..."

# Verificar se o ambiente virtual existe
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "❌ Ambiente virtual não encontrado. Execute ./scripts/install.sh primeiro."
    exit 1
fi

# Limpeza robusta de processos antigos
echo "🔄 Limpando processos antigos..."

# Matar processos Python do sistema Ki Aikido (backend)
pkill -f "python.*main.py" 2>/dev/null && echo "🔧 Processos Python do backend antigos finalizados"

# Matar processos do servidor HTTP do frontend
pkill -f "python3 -m http.server 8080 --directory frontend" 2>/dev/null && echo "🔧 Processos do servidor frontend antigos finalizados"

# Matar processos na porta 5000 (backend)
PIDS_BACKEND=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS_BACKEND" ]; then
    echo "🛑 Finalizando processos na porta 5000: $PIDS_BACKEND"
    echo $PIDS_BACKEND | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Matar processos na porta 8080 (frontend)
PIDS_FRONTEND=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PIDS_FRONTEND" ]; then
    echo "🛑 Finalizando processos na porta 8080: $PIDS_FRONTEND"
    echo $PIDS_FRONTEND | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Verificar se o banco de dados existe
if [ ! -f "$BACKEND_DIR/src/database/app.db" ]; then
    echo "⚠️  Banco de dados não encontrado. Inicializando..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    python3 -c "
import sys
sys.path.append(\".\")
from src.main import app, init_database
with app.app_context():
    init_database()
    print(\'✅ Banco de dados inicializado!\')
"
    cd "$PROJECT_DIR"
fi

# Iniciar backend em segundo plano
cd "$BACKEND_DIR"
source venv/bin/activate
python3 src/main.py > /dev/null 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_DIR"

echo "🚀 Servidor backend iniciado em http://localhost:5000 (PID: $BACKEND_PID)"

# Iniciar frontend em segundo plano
python3 -m http.server 8080 --directory "$FRONTEND_DIR" > /dev/null 2>&1 &
FRONTEND_PID=$!

echo "🌐 Servidor frontend iniciado em http://localhost:8080/ki-aikido-enhanced.html (PID: $FRONTEND_PID)"

echo ""
echo "🔑 Credenciais de teste:"
echo "   admin@kiaikido.com / 123456 (Administrador)"
echo "   florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)"
echo ""
echo "⏹️  Para parar o sistema, execute ./stop.sh ou pressione Ctrl+C"
echo "📊 Para verificar status: ./status.sh"
echo ""

# Esperar por Ctrl+C para finalizar os processos
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait $BACKEND_PID


