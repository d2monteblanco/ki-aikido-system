#!/bin/bash
# Script de restauração do banco de dados
# Restaura backup do banco SQLite

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Diretórios
APP_DIR="/opt/ki-aikido-system"
DB_FILE="$APP_DIR/backend/src/database/app.db"

# Verificar se arquivo de backup foi passado como argumento
if [ -z "$1" ]; then
    echo -e "${RED}Uso: $0 <arquivo_backup.db>${NC}"
    echo ""
    echo "Backups disponíveis:"
    ls -lh "$APP_DIR/backups/"app_*.db 2>/dev/null || echo "Nenhum backup encontrado"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar se arquivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}ATENÇÃO: Esta operação irá substituir o banco de dados atual!${NC}"
echo "Banco atual: $DB_FILE"
echo "Backup: $BACKUP_FILE"
echo ""
read -p "Deseja continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Fazer backup do banco atual antes de restaurar
echo -e "${GREEN}Fazendo backup de segurança do banco atual...${NC}"
SAFETY_BACKUP="$APP_DIR/backups/app_before_restore_$(date +%Y%m%d_%H%M%S).db"
cp "$DB_FILE" "$SAFETY_BACKUP"
echo "Backup de segurança criado: $SAFETY_BACKUP"

# Restaurar backup
echo -e "${GREEN}Restaurando banco de dados...${NC}"
cp "$BACKUP_FILE" "$DB_FILE"

# Ajustar permissões
chmod 644 "$DB_FILE"

# Verificar integridade do banco restaurado
echo "Verificando integridade do banco..."
if sqlite3 "$DB_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo -e "${GREEN}✓ Banco de dados restaurado com sucesso!${NC}"
    echo ""
    echo "Reinicie a aplicação:"
    echo "  sudo supervisorctl restart ki-aikido"
else
    echo -e "${RED}✗ Erro: Banco restaurado está corrompido!${NC}"
    echo "Restaurando backup de segurança..."
    cp "$SAFETY_BACKUP" "$DB_FILE"
    exit 1
fi
