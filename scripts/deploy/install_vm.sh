#!/bin/bash
# Script de instalação do Sistema Ki Aikido em Google Cloud VM
# Este script deve ser executado na VM após clonar o repositório

set -e  # Sair em caso de erro

echo "======================================"
echo "Instalação do Sistema Ki Aikido"
echo "======================================"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório da aplicação
APP_DIR="/opt/ki-aikido-system"

# Verificar se está no diretório correto
if [ "$PWD" != "$APP_DIR" ]; then
    echo -e "${YELLOW}Mudando para diretório da aplicação: $APP_DIR${NC}"
    cd "$APP_DIR"
fi

echo -e "${GREEN}[1/6] Verificando dependências do sistema...${NC}"
# Verificar se Python 3.8+ está instalado
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 não encontrado. Instalando...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Python versão: $PYTHON_VERSION"

echo -e "${GREEN}[2/6] Criando ambiente virtual Python...${NC}"
# Remover venv antigo se existir
if [ -d "backend/venv" ]; then
    echo "Removendo ambiente virtual antigo..."
    rm -rf backend/venv
fi

# Criar novo ambiente virtual
cd backend
python3 -m venv venv
source venv/bin/activate

echo -e "${GREEN}[3/6] Instalando dependências Python...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}[4/6] Criando diretórios necessários...${NC}"
cd ..
mkdir -p logs
mkdir -p backups
mkdir -p backend/src/database
mkdir -p backend/src/uploads/documents

echo -e "${GREEN}[5/6] Configurando banco de dados...${NC}"
cd backend
source venv/bin/activate

# Verificar se banco já existe
if [ -f "src/database/app.db" ]; then
    echo -e "${YELLOW}Banco de dados já existe. Pulando inicialização.${NC}"
    echo -e "${YELLOW}Para reinicializar, remova: backend/src/database/app.db${NC}"
else
    echo "Inicializando banco de dados com dados demo..."
    python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"
    echo -e "${GREEN}Banco de dados criado com sucesso!${NC}"
fi

echo -e "${GREEN}[6/6] Configurando permissões...${NC}"
cd ..
chmod -R 755 scripts
chmod 644 backend/src/database/app.db 2>/dev/null || true
chmod 755 backend/src/database 2>/dev/null || true

echo ""
echo -e "${GREEN}======================================"
echo "Instalação concluída com sucesso!"
echo "======================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure o Nginx:"
echo "   sudo cp scripts/deploy/nginx.conf /etc/nginx/sites-available/ki-aikido"
echo "   sudo ln -s /etc/nginx/sites-available/ki-aikido /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo "2. Configure o Supervisor:"
echo "   sudo cp scripts/deploy/supervisor.conf /etc/supervisor/conf.d/ki-aikido.conf"
echo "   sudo supervisorctl reread && sudo supervisorctl update"
echo "   sudo supervisorctl start ki-aikido"
echo ""
echo "3. Verifique o status:"
echo "   sudo supervisorctl status ki-aikido"
echo "   curl http://localhost/api/health"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "- Altere a SECRET_KEY em backend/src/main.py antes de usar em produção"
echo "- Altere a senha do admin após primeiro acesso"
echo "- Configure firewall para permitir tráfego HTTP/HTTPS"
echo ""
