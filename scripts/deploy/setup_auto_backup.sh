#!/bin/bash
# Script para configurar backup automático via cron
# Executa backup diário às 3h da manhã

set -e

echo "======================================"
echo "Configurar Backup Automático"
echo "======================================"
echo ""

# Diretório da aplicação
APP_DIR="/opt/ki-aikido-system"

# Verificar se está na VM
if [ ! -d "$APP_DIR" ]; then
    echo "ERRO: Diretório $APP_DIR não encontrado"
    echo "Este script deve ser executado na VM de produção"
    exit 1
fi

echo "Configurando backup automático diário às 3h da manhã..."
echo ""

# Criar entrada no crontab
CRON_ENTRY="0 3 * * * $APP_DIR/scripts/deploy/backup_db.sh >> $APP_DIR/logs/backup.log 2>&1"

# Verificar se já existe
if crontab -l 2>/dev/null | grep -q "backup_db.sh"; then
    echo "Backup automático já está configurado."
    echo ""
    echo "Entradas existentes:"
    crontab -l | grep backup_db.sh
else
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    echo "✓ Backup automático configurado com sucesso!"
fi

echo ""
echo "Verificando configuração do cron:"
crontab -l | grep backup_db.sh || echo "Nenhuma configuração encontrada"

echo ""
echo "Para remover o backup automático:"
echo "  crontab -e"
echo "  # Remova a linha que contém: backup_db.sh"
echo ""
echo "Para testar o backup manualmente:"
echo "  $APP_DIR/scripts/deploy/backup_db.sh"
echo ""
