#!/bin/bash

# Script de Instalação do Sistema Ki Aikido
# Autor: Sistema Manus
# Versão: 1.0

set -e  # Parar em caso de erro

echo "🥋 Instalando Sistema Ki Aikido..."
echo "=================================="

# Cores para output
RED=\'\\033[0;31m\'
GREEN=\'\\033[0;32m\'
YELLOW=\'\\033[1;33m\'
BLUE=\'\\033[0;34m\'
NC=\'\\033[0m\' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando no Ubuntu
if ! command -v apt &> /dev/null; then
    log_error "Este script é para Ubuntu/Debian. Sistema não suportado."
    exit 1
fi

# Verificar se está rodando como usuário normal (não root)
if [ "$EUID" -eq 0 ]; then
    log_error "Não execute este script como root. Use seu usuário normal."
    exit 1
fi

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
DATA_DIR="$PROJECT_DIR/data"

log_info "Diretório do projeto: $PROJECT_DIR"

# 1. Atualizar sistema
log_info "Atualizando sistema Ubuntu..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências do sistema
log_info "Instalando dependências do sistema..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    curl \
    wget \
    git \
    sqlite3 \
    nginx \
    supervisor \
    ufw

# 3. Instalar Node.js (para possíveis futuras melhorias no frontend)
log_info "Instalando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. Criar ambiente virtual Python
log_info "Criando ambiente virtual Python..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 5. Ativar ambiente virtual e instalar dependências Python
log_info "Instalando dependências Python..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 6. Criar diretório de banco de dados
log_info "Configurando banco de dados..."
mkdir -p "$BACKEND_DIR/database"

# 7. Inicializar banco de dados com dados de exemplo
log_info "Inicializando banco de dados..."
cd "$BACKEND_DIR"
python3 -c "
import sys
sys.path.append(\".\")
from src.main import app, init_database
with app.app_context():
    init_database()
print(\'Banco de dados inicializado com sucesso!\')
"

# 8. Executar migrações das novas tabelas
log_info "Executando migrações das tabelas de membros..."
python3 src/migrations/add_member_status_tables.py

# 9. Criar arquivo de configuração local
log_info "Criando configuração local..."
cat > "$PROJECT_DIR/.env" << EOF
# Configuração Local do Sistema Ki Aikido
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///database/app.db
SECRET_KEY=ki-aikido-local-secret-key-$(date +%s)
PORT=5000
HOST=127.0.0.1
EOF

# 9. Criar script de inicialização
log_info "Criando scripts de controle..."
cat > "$PROJECT_DIR/start.sh" << \'EOF\'
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
echo "📱 Arquivo local: file://$PROJECT_DIR/frontend/ki-aikido-enhanced.html"
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
EOF

chmod +x "$PROJECT_DIR/start.sh"

# 10. Criar script de parada
cat > "$PROJECT_DIR/stop.sh" << \'EOF\'
#!/bin/bash
# Script para parar o Sistema Ki Aikido

echo "🛑 Parando Sistema Ki Aikido..."

# Parar processos Python do Ki Aikido (graceful)
PIDS_BACKEND=$(ps aux | grep "python src/main.py" | grep -v grep | awk \'\{print $2}\'\')
if [ ! -z "$PIDS_BACKEND" ]; then
    echo "🔄 Enviando sinal TERM para processos Python do backend..."
    echo $PIDS_BACKEND | xargs kill -TERM 2>/dev/null || true
    sleep 3
    
    # Verificar se ainda estão rodando
    PIDS_BACKEND=$(ps aux | grep "python src/main.py" | grep -v grep | awk \'\{print $2}\'\')
    if [ ! -z "$PIDS_BACKEND" ]; then
        echo "🔨 Forçando parada dos processos do backend (KILL)..."
        echo $PIDS_BACKEND | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Parar processos do servidor HTTP do frontend
PIDS_FRONTEND=$(ps aux | grep "python3 -m http.server 8080 --directory frontend" | grep -v grep | awk \'\{print $2}\'\')
if [ ! -z "$PIDS_FRONTEND" ]; then
    echo "🔄 Enviando sinal TERM para processos do frontend..."
    echo $PIDS_FRONTEND | xargs kill -TERM 2>/dev/null || true
    sleep 3
    
    # Verificar se ainda estão rodando
    PIDS_FRONTEND=$(ps aux | grep "python3 -m http.server 8080 --directory frontend" | grep -v grep | awk \'\{print $2}\'\')
    if [ ! -z "$PIDS_FRONTEND" ]; then
        echo "🔨 Forçando parada dos processos do frontend (KILL)..."
        echo $PIDS_FRONTEND | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Limpar qualquer processo travado
STOPPED_PROCS=$(ps aux | grep python | grep -E \'\\sT\\s\' | grep -E "(main.py|http.server)")
if [ ! -z "$STOPPED_PROCS" ]; then
    echo "🔧 Limpando processos travados..."
    pkill -f "python.*(main.py|http.server)" 2>/dev/null
fi

# Parar qualquer processo na porta 5000
PIDS_5000=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS_5000" ]; then
    echo "🔄 Liberando porta 5000 (PIDs: $PIDS_5000)..."
    echo $PIDS_5000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Parar qualquer processo na porta 8080
PIDS_8080=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PIDS_8080" ]; then
    echo "🔄 Liberando porta 8080 (PIDs: $PIDS_8080)..."
    echo $PIDS_8080 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Verificação final
if pgrep -f "python.*(main.py|http.server)" > /dev/null; then
    echo "⚠️  Alguns processos ainda podem estar rodando"
    echo "🔍 Execute \'./status.sh\' para verificar"
else
    echo "✅ Todos os processos do Ki Aikido foram finalizados"
fi

# Verificar se as portas estão livres
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "⚠️  Porta 5000 ainda ocupada por outro processo"
else
    echo "✅ Porta 5000 liberada"
fi

if lsof -ti:8080 >/dev/null 2>&1; then
    echo "⚠️  Porta 8080 ainda ocupada por outro processo"
else
    echo "✅ Porta 8080 liberada"
fi

echo "🏁 Sistema parado com sucesso."
EOF

chmod +x "$PROJECT_DIR/stop.sh"

# 11. Criar script de atualização
cat > "$PROJECT_DIR/update.sh" << \'EOF\'
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
sys.path.append(\".\")
from src.main import app
from src.models import db
with app.app_context():
    db.create_all()
print(\'Banco de dados atualizado!\')
"

echo "✅ Sistema atualizado com sucesso!"
echo "🚀 Execute ./start.sh para iniciar o sistema."
EOF

chmod +x "$PROJECT_DIR/update.sh"

# 12. Configurar firewall (opcional)
log_info "Configurando firewall..."
sudo ufw allow 5000/tcp 2>/dev/null || true

# 13. Criar arquivo de status
cat > "$PROJECT_DIR/status.sh" << \'EOF\'
#!/bin/bash
# Script para verificar status do Sistema Ki Aikido

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "📊 Status do Sistema Ki Aikido"
echo "=============================="

# Verificar se o ambiente virtual existe
if [ -d "$BACKEND_DIR/venv" ]; then
    echo "✅ Ambiente virtual: OK"
else
    echo "❌ Ambiente virtual: NÃO ENCONTRADO"
fi

# Verificar se o banco existe
if [ -f "$BACKEND_DIR/database/app.db" ]; then
    echo "✅ Banco de dados: OK"
    
    # Mostrar estatísticas do banco
    cd "$BACKEND_DIR"
    source venv/bin/activate 2>/dev/null
    python3 -c "
import sys
sys.path.append(\".\")
from src.main import app
from src.models import Student, Dojo, User
with app.app_context():
    print(f\'👥 Usuários: {User.query.count()}\')
    print(f\'🏢 Dojos: {Dojo.query.count()}\')
    print(f\'🎓 Alunos: {Student.query.count()}\')
" 2>/dev/null || echo "⚠️  Não foi possível acessar estatísticas do banco"
else
    echo "❌ Banco de dados: NÃO ENCONTRADO"
fi

# Verificar se o servidor backend está rodando
if pgrep -f "python3 src/main.py" > /dev/null; then
    echo "🟢 Servidor Backend: RODANDO"
    echo "🌐 URL Backend: http://localhost:5000"
else
    echo "🔴 Servidor Backend: PARADO"
fi

# Verificar se o servidor frontend está rodando
if pgrep -f "python3 -m http.server 8080 --directory frontend" > /dev/null; then
    echo "🟢 Servidor Frontend: RODANDO"
    echo "🌐 URL Frontend: http://localhost:8080/ki-aikido-enhanced.html"
else
    echo "🔴 Servidor Frontend: PARADO"
fi

echo ""
echo "🚀 Para iniciar: ./start.sh"
echo "🛑 Para parar: ./stop.sh"
echo "🔄 Para atualizar: ./update.sh"
EOF

chmod +x "$PROJECT_DIR/status.sh"

# 14. Finalização
log_success "Instalação concluída com sucesso!"
echo ""
echo "🎉 Sistema Ki Aikido instalado!"
echo "================================"
echo ""
echo "📁 Localização: $PROJECT_DIR"
echo "🚀 Para iniciar: ./start.sh"
echo "📊 Para status: ./status.sh"
echo "🔄 Para atualizar: ./update.sh"
echo ""
echo "📱 Frontend: http://localhost:8080/ki-aikido-enhanced.html"
echo "📁 Arquivo local: file://$PROJECT_DIR/frontend/ki-aikido-enhanced.html"
echo "🌐 Backend: http://localhost:5000"
echo ""
echo "👤 Usuários de teste:"
echo "   admin@kiaikido.com / 123456 (Administrador)"
echo "   florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)"
echo ""
echo "📚 Documentação: $PROJECT_DIR/docs/"
echo ""
log_info "Execute \'./start.sh\' para iniciar o sistema agora!"


