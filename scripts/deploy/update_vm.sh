#!/bin/bash
# Script de atualização do Sistema Ki Aikido em Google Cloud VM
# Faz pull das últimas alterações do branch production e reinicia a aplicação

set -e  # Sair em caso de erro

echo "======================================"
echo "Atualização do Sistema Ki Aikido"
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

echo -e "${GREEN}[1/8] Fazendo backup do banco de dados...${NC}"
./scripts/deploy/backup_db.sh

echo -e "${GREEN}[2/8] Parando aplicação...${NC}"
sudo supervisorctl stop ki-aikido || echo "Aplicação não está rodando via supervisor"

echo -e "${GREEN}[3/8] Atualizando código do repositório...${NC}"
git fetch origin production
BEFORE_COMMIT=$(git rev-parse HEAD)
git pull origin production
AFTER_COMMIT=$(git rev-parse HEAD)

if [ "$BEFORE_COMMIT" = "$AFTER_COMMIT" ]; then
    echo -e "${YELLOW}Nenhuma atualização encontrada. Sistema já está atualizado.${NC}"
else
    echo -e "${GREEN}Atualizado de $BEFORE_COMMIT para $AFTER_COMMIT${NC}"
fi

echo -e "${GREEN}[4/8] Atualizando ambiente virtual...${NC}"
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}[5/8] Verificando migrações de banco de dados...${NC}"
# Aqui você pode adicionar lógica de migração se necessário
echo "Nenhuma migração necessária no momento."

echo -e "${GREEN}[6/8] Limpando cache e arquivos temporários...${NC}"
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -depth -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

echo -e "${GREEN}[7/8] Reiniciando aplicação...${NC}"
cd ..
sudo supervisorctl start ki-aikido
sleep 3

echo -e "${GREEN}[8/8] Verificando status...${NC}"
sudo supervisorctl status ki-aikido

# Verificar se API está respondendo
echo "Testando API..."
sleep 2
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API está respondendo corretamente${NC}"
else
    echo -e "${RED}✗ API não está respondendo. Verifique os logs.${NC}"
    echo "Logs de erro:"
    tail -n 20 logs/error.log
    exit 1
fi

echo ""
echo -e "${GREEN}======================================"
echo "Atualização concluída com sucesso!"
echo "======================================${NC}"
echo ""
echo "Alterações aplicadas: $(git log --oneline $BEFORE_COMMIT..$AFTER_COMMIT | wc -l) commits"
echo ""
echo "Para ver os logs:"
echo "  tail -f $APP_DIR/logs/app.log"
echo "  tail -f $APP_DIR/logs/error.log"
echo ""
