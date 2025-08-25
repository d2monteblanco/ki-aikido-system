#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Instalação Rápida
# =============================================================================
# Versão: 2.0
# Descrição: Script de instalação rápida sem interações do usuário
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 Sistema Ki Aikido - Instalação Rápida${NC}"
echo -e "${CYAN}=======================================${NC}"

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Executar instalação principal sem interações
export DEBIAN_FRONTEND=noninteractive

echo -e "${GREEN}📦 Iniciando instalação automatizada...${NC}"

# Executar script principal
"$PROJECT_DIR/scripts/install.sh" || {
    echo -e "${RED}❌ Erro na instalação${NC}"
    exit 1
}

echo -e "${GREEN}✅ Instalação rápida concluída!${NC}"
echo -e "${CYAN}Execute: ./start.sh para iniciar o sistema${NC}"

