#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Script de Backup
# =============================================================================
# Versão: 2.0
# Descrição: Cria backup completo do sistema e dados
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
BACKUP_BASE_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$TIMESTAMP"

echo -e "${CYAN}💾 Sistema Ki Aikido - Backup${NC}"
echo -e "${CYAN}=============================${NC}"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

echo -e "${CYAN}📦 Criando backup completo...${NC}"

# Backup do banco de dados
if [[ -f "$BACKEND_DIR/src/database/app.db" ]]; then
    echo -e "${CYAN}🗄️  Fazendo backup do banco de dados...${NC}"
    cp "$BACKEND_DIR/src/database/app.db" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Banco de dados: app.db${NC}"
fi

# Backup de configurações
echo -e "${CYAN}⚙️  Fazendo backup das configurações...${NC}"
if [[ -f "$PROJECT_DIR/config.sh" ]]; then
    cp "$PROJECT_DIR/config.sh" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Configurações: config.sh${NC}"
fi

# Backup dos requirements
if [[ -f "$BACKEND_DIR/requirements.txt" ]]; then
    cp "$BACKEND_DIR/requirements.txt" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Dependências: requirements.txt${NC}"
fi

# Backup de logs importantes
echo -e "${CYAN}📋 Fazendo backup dos logs...${NC}"
mkdir -p "$BACKUP_DIR/logs"
find "$PROJECT_DIR" -name "*.log" -type f -exec cp {} "$BACKUP_DIR/logs/" \; 2>/dev/null || true

# Backup do código customizado (se houver)
if [[ -d "$PROJECT_DIR/custom" ]]; then
    echo -e "${CYAN}🔧 Fazendo backup de customizações...${NC}"
    cp -r "$PROJECT_DIR/custom" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Customizações incluídas${NC}"
fi

# Criar arquivo de informações do backup
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Sistema Ki Aikido - Informações do Backup
==========================================

Data/Hora: $(date)
Versão: 2.0
Diretório Original: $PROJECT_DIR

Conteúdo do Backup:
- app.db (banco de dados SQLite)
- config.sh (configurações do sistema)
- requirements.txt (dependências Python)
- logs/ (arquivos de log)
- custom/ (customizações, se existirem)

Para restaurar:
1. Pare o sistema: ./stop.sh
2. Copie app.db para backend/src/database/
3. Copie config.sh para o diretório raiz
4. Execute: ./scripts/update.sh
5. Inicie o sistema: ./start.sh
EOF

# Compactar backup (se zip estiver disponível)
if command -v zip >/dev/null 2>&1; then
    echo -e "${CYAN}🗜️  Compactando backup...${NC}"
    cd "$BACKUP_BASE_DIR"
    zip -r "backup_$TIMESTAMP.zip" "backup_$TIMESTAMP" >/dev/null
    rm -rf "backup_$TIMESTAMP"
    echo -e "${GREEN}✅ Backup compactado: backup_$TIMESTAMP.zip${NC}"
    BACKUP_FILE="$BACKUP_BASE_DIR/backup_$TIMESTAMP.zip"
else
    echo -e "${YELLOW}⚠️  zip não disponível, backup mantido descompactado${NC}"
    BACKUP_FILE="$BACKUP_DIR"
fi

# Estatísticas do backup
if [[ -f "$BACKUP_FILE" ]]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
else
    BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
fi

echo -e "${GREEN}✅ Backup concluído com sucesso!${NC}"
echo -e "${CYAN}📁 Local: $BACKUP_FILE${NC}"
echo -e "${CYAN}📊 Tamanho: $BACKUP_SIZE${NC}"

# Limpar backups antigos (manter apenas os 10 mais recentes)
echo -e "${CYAN}🧹 Limpando backups antigos...${NC}"
cd "$BACKUP_BASE_DIR" 2>/dev/null || exit 0
ls -t backup_*.zip 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
ls -dt backup_* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true

echo -e "${GREEN}🎉 Backup finalizado!${NC}"

