#!/bin/bash

# Script de Instalação do Sistema Ki Aikido
# Autor: Sistema Manus
# Versão: 1.0

set -e  # Parar em caso de erro

echo "🥋 Instalando Sistema Ki Aikido..."
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
sys.path.append('.')
from src.main import app, init_database
with app.app_context():
    init_database()
print('Banco de dados inicializado com sucesso!')
"

# 8. Criar arquivo de configuração local
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
cat > "$PROJECT_DIR/start.sh" << 'EOF'
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

# Iniciar backend
cd "$BACKEND_DIR"
source venv/bin/activate
echo "🚀 Iniciando servidor backend em http://localhost:5000"
echo "📱 Abra o frontend em: file://$PROJECT_DIR/frontend/ki-aikido-simple.html"
echo "⏹️  Para parar o servidor, pressione Ctrl+C"
echo ""
python3 src/main.py
EOF

chmod +x "$PROJECT_DIR/start.sh"

# 10. Criar script de parada
cat > "$PROJECT_DIR/stop.sh" << 'EOF'
#!/bin/bash
# Script para parar o Sistema Ki Aikido

echo "🛑 Parando Sistema Ki Aikido..."

# Matar processos do Flask
pkill -f "python3 src/main.py" 2>/dev/null || true
pkill -f "flask run" 2>/dev/null || true

echo "✅ Sistema parado."
EOF

chmod +x "$PROJECT_DIR/stop.sh"

# 11. Criar script de atualização
cat > "$PROJECT_DIR/update.sh" << 'EOF'
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
EOF

chmod +x "$PROJECT_DIR/update.sh"

# 12. Configurar firewall (opcional)
log_info "Configurando firewall..."
sudo ufw allow 5000/tcp 2>/dev/null || true

# 13. Criar arquivo de status
cat > "$PROJECT_DIR/status.sh" << 'EOF'
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
if [ -f "$BACKEND_DIR/database/app.db" ]; then
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

# Verificar se o servidor está rodando
if pgrep -f "python3 src/main.py" > /dev/null; then
    echo "🟢 Servidor: RODANDO"
    echo "🌐 URL: http://localhost:5000"
else
    echo "🔴 Servidor: PARADO"
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
echo "📱 Frontend: file://$PROJECT_DIR/frontend/ki-aikido-simple.html"
echo "🌐 Backend: http://localhost:5000"
echo ""
echo "👤 Usuários de teste:"
echo "   admin@kiaikido.com / 123456 (Administrador)"
echo "   florianopolis@kiaikido.com / 123456 (Dojo Florianópolis)"
echo ""
echo "📚 Documentação: $PROJECT_DIR/docs/"
echo ""
log_info "Execute './start.sh' para iniciar o sistema agora!"

