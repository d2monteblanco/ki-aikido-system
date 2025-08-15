#!/bin/bash
# Configuração centralizada do Sistema Ki Aikido

# Configurações principais
export KI_AIKIDO_PORT=5000
export KI_AIKIDO_HOST=127.0.0.1
export KI_AIKIDO_ENV=development
export KI_AIKIDO_DEBUG=true

# Caminhos
export PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export BACKEND_DIR="$PROJECT_DIR/backend"
export FRONTEND_DIR="$PROJECT_DIR/frontend"
export DATABASE_PATH="$BACKEND_DIR/src/database/app.db"

# Frontend principal
export FRONTEND_FILE="ki-aikido-enhanced.html"

# Função para verificar se a porta está livre
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 1  # Porta ocupada
    else
        return 0  # Porta livre
    fi
}

# Função para encontrar porta livre
find_free_port() {
    local start_port=$1
    local port=$start_port
    
    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 10)) ]; then
            echo "Erro: Não foi possível encontrar porta livre entre $start_port e $((start_port + 10))"
            return 1
        fi
    done
    
    echo $port
    return 0
}

# Função para limpar processos antigos
cleanup_processes() {
    echo "🔄 Limpando processos antigos..."
    
    # Matar processos Python do sistema Ki Aikido
    pkill -f "python.*main.py" 2>/dev/null && echo "🔧 Processos Python antigos finalizados"
    
    # Matar processos na porta configurada
    local pids=$(lsof -ti:$KI_AIKIDO_PORT 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🛑 Finalizando processos na porta $KI_AIKIDO_PORT: $pids"
        echo $pids | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Função para verificar dependências
check_dependencies() {
    echo "🔍 Verificando dependências..."
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 não encontrado"
        return 1
    fi
    
    # Verificar ambiente virtual
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        echo "❌ Ambiente virtual não encontrado"
        return 1
    fi
    
    # Verificar banco de dados
    if [ ! -f "$DATABASE_PATH" ]; then
        echo "⚠️  Banco de dados não encontrado em $DATABASE_PATH"
        return 1
    fi
    
    # Verificar frontend
    if [ ! -f "$FRONTEND_DIR/$FRONTEND_FILE" ]; then
        echo "❌ Frontend não encontrado: $FRONTEND_DIR/$FRONTEND_FILE"
        return 1
    fi
    
    echo "✅ Todas as dependências verificadas"
    return 0
}

# Função para exibir informações do sistema
show_info() {
    echo "📊 Informações do Sistema Ki Aikido"
    echo "===================================="
    echo "🏠 Diretório: $PROJECT_DIR"
    echo "🌐 Host: $KI_AIKIDO_HOST"
    echo "🔌 Porta: $KI_AIKIDO_PORT"
    echo "📱 Frontend: file://$FRONTEND_DIR/$FRONTEND_FILE"
    echo "🗄️  Banco: $DATABASE_PATH"
    echo "🔧 Ambiente: $KI_AIKIDO_ENV"
    echo ""
}

