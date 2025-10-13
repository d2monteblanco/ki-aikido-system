#!/bin/bash
# Script de backup do banco de dados
# Cria backup com timestamp do banco SQLite

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretórios
APP_DIR="/opt/ki-aikido-system"
BACKUP_DIR="$APP_DIR/backups"
DB_FILE="$APP_DIR/backend/src/database/app.db"

# Verificar se está no diretório correto
if [ "$PWD" != "$APP_DIR" ]; then
    cd "$APP_DIR"
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se banco de dados existe
if [ ! -f "$DB_FILE" ]; then
    echo -e "${YELLOW}Banco de dados não encontrado: $DB_FILE${NC}"
    exit 1
fi

# Nome do arquivo de backup com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/app_${TIMESTAMP}.db"

echo -e "${GREEN}Criando backup do banco de dados...${NC}"
echo "Origem: $DB_FILE"
echo "Destino: $BACKUP_FILE"

# Fazer backup usando sqlite3 para garantir consistência
sqlite3 "$DB_FILE" ".backup '$BACKUP_FILE'"

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup criado com sucesso!${NC}"
    echo "Tamanho: $BACKUP_SIZE"
    
    # Manter apenas os últimos 30 backups
    echo "Limpando backups antigos (mantendo últimos 30)..."
    cd "$BACKUP_DIR"
    ls -t app_*.db | tail -n +31 | xargs -r rm --
    
    BACKUP_COUNT=$(ls -1 app_*.db 2>/dev/null | wc -l)
    echo "Backups disponíveis: $BACKUP_COUNT"
else
    echo -e "${RED}✗ Erro ao criar backup${NC}"
    exit 1
fi
