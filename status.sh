#!/bin/bash
# Script para verificar status do Sistema Ki Aikido

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "📊 Status do Sistema Ki Aikido"
echo "=============================="

# Verificar se o ambiente virtual existe
if [ -d "$BACKEND_DIR/venv" ]; then
    echo "✅ Ambiente virtual: OK"
else
    echo "❌ Ambiente virtual: NÃO ENCONTRADO"
fi

# Verificar se o banco existe
if [ -f "$BACKEND_DIR/src/database/app.db" ]; then
    echo "✅ Banco de dados: OK"
    
    # Mostrar estatísticas do banco
    cd "$BACKEND_DIR"
    source venv/bin/activate 2>/dev/null
    python3 -c "
import sys
sys.path.append('.')
from src.main import app
from src.models import Student, Dojo, User
with app.app_context():
    print(f'👥 Usuários: {User.query.count()}')
    print(f'🏢 Dojos: {Dojo.query.count()}')
    print(f'🎓 Alunos: {Student.query.count()}')
" 2>/dev/null || echo "⚠️  Não foi possível acessar estatísticas do banco"
else
    echo "❌ Banco de dados: NÃO ENCONTRADO"
fi

# Verificar processos travados primeiro
STOPPED_PROCS=$(ps aux | grep python | grep -E '\sT\s' | grep main.py)
if [ ! -z "$STOPPED_PROCS" ]; then
    echo "⚠️  Processos travados detectados:"
    echo "$STOPPED_PROCS"
    echo "🔧 Limpando processos travados..."
    
    # Matar processos travados
    pkill -f "python.*main.py" 2>/dev/null
    sleep 2
    
    # Matar qualquer processo na porta 5000
    PIDS_5000=$(lsof -ti:5000 2>/dev/null)
    if [ ! -z "$PIDS_5000" ]; then
        echo "🔧 Matando processos na porta 5000: $PIDS_5000"
        kill -9 $PIDS_5000 2>/dev/null
        sleep 1
    fi
    
    echo "✅ Processos limpos!"
fi

# Verificar se o servidor está rodando
if pgrep -f "python3 src/main.py" > /dev/null; then
    echo "🟢 Servidor: RODANDO"
    echo "🌐 URL: http://localhost:5000"
    
    # Testar API com timeout
    if curl -s --connect-timeout 3 http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ API: RESPONDENDO"
    else
        echo "⚠️  API: NÃO RESPONDE (processo pode estar travado)"
        echo "🔧 Tentando corrigir automaticamente..."
        
        # Matar processos travados
        pkill -f "python.*main.py" 2>/dev/null
        sleep 2
        
        # Matar qualquer processo na porta 5000
        PIDS_5000=$(lsof -ti:5000 2>/dev/null)
        if [ ! -z "$PIDS_5000" ]; then
            echo "🔧 Matando processos na porta 5000: $PIDS_5000"
            kill -9 $PIDS_5000 2>/dev/null
        fi
        
        echo "✅ Processos limpos. Execute './start.sh' para reiniciar."
    fi
else
    echo "🔴 Servidor: PARADO"
fi

# Verificar porta 5000
PORT_CHECK=$(netstat -tlnp 2>/dev/null | grep :5000)
if [ ! -z "$PORT_CHECK" ]; then
    echo "✅ Porta 5000: Em uso"
    echo "   $PORT_CHECK"
else
    echo "❌ Porta 5000: Livre"
fi

# Verificar frontend
if [ -f "$PROJECT_DIR/frontend/ki-aikido-simple.html" ]; then
    echo "✅ Frontend: OK"
    echo "📱 Arquivo: file://$PROJECT_DIR/frontend/ki-aikido-simple.html"
else
    echo "❌ Frontend: NÃO ENCONTRADO"
fi

echo ""
echo "🚀 Para iniciar: ./start.sh"
echo "🛑 Para parar: ./stop.sh"
echo "🔄 Para atualizar: ./update.sh"

