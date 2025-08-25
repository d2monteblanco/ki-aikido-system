#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Script de Desinstalação
# =============================================================================
# Versão: 2.0
# Descrição: Remove completamente o Sistema Ki Aikido
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${CYAN}🗑️  Sistema Ki Aikido - Desinstalação${NC}"
echo -e "${CYAN}====================================${NC}"

# Confirmação
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta ação irá remover completamente o Sistema Ki Aikido${NC}"
echo -e "${YELLOW}   Isso inclui:${NC}"
echo -e "${YELLOW}   • Ambiente virtual Python${NC}"
echo -e "${YELLOW}   • Banco de dados e todos os dados${NC}"
echo -e "${YELLOW}   • Logs e arquivos temporários${NC}"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'CONFIRMAR'): " confirmation

if [[ "$confirmation" != "CONFIRMAR" ]]; then
    echo -e "${GREEN}✅ Desinstalação cancelada${NC}"
    exit 0
fi

echo -e "${CYAN}🛑 Parando serviços...${NC}"
# Parar serviços se estiverem rodando
if [[ -f "$PROJECT_DIR/stop.sh" ]]; then
    "$PROJECT_DIR/stop.sh" 2>/dev/null || true
fi

# Matar processos relacionados
pkill -f "flask run" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "python.*http.server" 2>/dev/null || true

echo -e "${CYAN}🗑️  Removendo ambiente virtual...${NC}"
if [[ -d "$BACKEND_DIR/venv" ]]; then
    rm -rf "$BACKEND_DIR/venv"
    echo -e "${GREEN}✅ Ambiente virtual removido${NC}"
fi

echo -e "${CYAN}🗑️  Removendo banco de dados...${NC}"
if [[ -f "$BACKEND_DIR/src/database/app.db" ]]; then
    rm -f "$BACKEND_DIR/src/database/app.db"
    echo -e "${GREEN}✅ Banco de dados removido${NC}"
fi

echo -e "${CYAN}🗑️  Removendo logs...${NC}"
rm -f "$PROJECT_DIR"/*.log 2>/dev/null || true
rm -f "$PROJECT_DIR/backend"/*.log 2>/dev/null || true

echo -e "${CYAN}🗑️  Removendo arquivos temporários...${NC}"
find "$PROJECT_DIR" -name "*.pyc" -delete 2>/dev/null || true
find "$PROJECT_DIR" -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find "$PROJECT_DIR" -name "*.tmp" -delete 2>/dev/null || true

echo -e "${GREEN}✅ Desinstalação concluída com sucesso!${NC}"
echo -e "${CYAN}Para reinstalar, execute: ./scripts/install.sh${NC}"

