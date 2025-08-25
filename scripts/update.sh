#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Script de Atualização
# =============================================================================
# Versão: 2.0
# Descrição: Atualiza o Sistema Ki Aikido preservando dados
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Configurações
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKUP_DIR="$PROJECT_DIR/backup_$(date +%Y%m%d_%H%M%S)"

echo -e "${CYAN}🔄 Sistema Ki Aikido - Atualização${NC}"
echo -e "${CYAN}=================================${NC}"

# Verificar se o sistema está instalado
if [[ ! -d "$BACKEND_DIR/venv" ]]; then
    echo -e "${RED}❌ Sistema não está instalado. Execute primeiro: ./scripts/install.sh${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Verificando status atual...${NC}"
if [[ -f "$PROJECT_DIR/status.sh" ]]; then
    "$PROJECT_DIR/status.sh" --quiet 2>/dev/null || true
fi

echo -e "${CYAN}🛑 Parando serviços...${NC}"
if [[ -f "$PROJECT_DIR/stop.sh" ]]; then
    "$PROJECT_DIR/stop.sh" 2>/dev/null || true
fi

echo -e "${CYAN}💾 Criando backup...${NC}"
mkdir -p "$BACKUP_DIR"

# Backup do banco de dados
if [[ -f "$BACKEND_DIR/src/database/app.db" ]]; then
    cp "$BACKEND_DIR/src/database/app.db" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup do banco de dados criado${NC}"
fi

# Backup de configurações
if [[ -f "$PROJECT_DIR/config.sh" ]]; then
    cp "$PROJECT_DIR/config.sh" "$BACKUP_DIR/"
fi

echo -e "${CYAN}🔄 Atualizando dependências...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Atualizar dependências
pip install --upgrade -r requirements.txt

echo -e "${CYAN}🗄️  Executando migrações...${NC}"
# Executar migrações se existirem
if [[ -d "$BACKEND_DIR/src/migrations" ]]; then
    for migration in "$BACKEND_DIR/src/migrations"/*.py; do
        if [[ -f "$migration" && "$(basename "$migration")" != "__init__.py" ]]; then
            echo -e "${CYAN}📝 Executando migração: $(basename "$migration")${NC}"
            python3 "$migration" 2>/dev/null || {
                echo -e "${YELLOW}⚠️  Migração já executada ou erro (normal): $(basename "$migration")${NC}"
            }
        fi
    done
fi

echo -e "${CYAN}🧪 Testando sistema atualizado...${NC}"
python3 -c "
import sys
import os
sys.path.append('src')

from src.models import db, User
from src.main import create_app

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f'✅ Sistema funcionando. {len(users)} usuários encontrados.')
" || {
    echo -e "${RED}❌ Erro no teste pós-atualização${NC}"
    echo -e "${YELLOW}🔄 Restaurando backup...${NC}"
    
    if [[ -f "$BACKUP_DIR/app.db" ]]; then
        cp "$BACKUP_DIR/app.db" "$BACKEND_DIR/src/database/"
        echo -e "${GREEN}✅ Backup restaurado${NC}"
    fi
    
    exit 1
}

echo -e "${GREEN}✅ Atualização concluída com sucesso!${NC}"
echo -e "${CYAN}📁 Backup salvo em: $BACKUP_DIR${NC}"
echo -e "${CYAN}🚀 Execute ./start.sh para iniciar o sistema atualizado${NC}"

# Limpar backups antigos (manter apenas os 5 mais recentes)
echo -e "${CYAN}🧹 Limpando backups antigos...${NC}"
cd "$PROJECT_DIR"
ls -dt backup_* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

