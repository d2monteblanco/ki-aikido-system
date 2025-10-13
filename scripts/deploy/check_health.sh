#!/bin/bash
# Script de verificação de saúde do sistema
# Verifica se todos os componentes estão funcionando

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "Verificação de Saúde - Ki Aikido"
echo "======================================"
echo ""

# 1. Verificar Supervisor
echo -n "Supervisor (ki-aikido): "
if sudo supervisorctl status ki-aikido | grep -q "RUNNING"; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FALHOU${NC}"
    sudo supervisorctl status ki-aikido
fi

# 2. Verificar Nginx
echo -n "Nginx: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FALHOU${NC}"
fi

# 3. Verificar API (health endpoint)
echo -n "API (http://localhost:5000/api/health): "
if curl -s -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FALHOU${NC}"
fi

# 4. Verificar Frontend (via Nginx)
echo -n "Frontend (http://localhost): "
if curl -s -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FALHOU${NC}"
fi

# 5. Verificar banco de dados
echo -n "Banco de dados: "
DB_FILE="/opt/ki-aikido-system/backend/src/database/app.db"
if [ -f "$DB_FILE" ]; then
    if sqlite3 "$DB_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ CORROMPIDO${NC}"
    fi
else
    echo -e "${RED}✗ NÃO ENCONTRADO${NC}"
fi

# 6. Verificar espaço em disco
echo -n "Espaço em disco: "
DISK_USAGE=$(df -h /opt/ki-aikido-system | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ OK (${DISK_USAGE}% usado)${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠ ATENÇÃO (${DISK_USAGE}% usado)${NC}"
else
    echo -e "${RED}✗ CRÍTICO (${DISK_USAGE}% usado)${NC}"
fi

# 7. Verificar memória
echo -n "Memória: "
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEM_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ OK (${MEM_USAGE}% usado)${NC}"
elif [ "$MEM_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}⚠ ATENÇÃO (${MEM_USAGE}% usado)${NC}"
else
    echo -e "${RED}✗ CRÍTICO (${MEM_USAGE}% usado)${NC}"
fi

echo ""
echo "======================================"
echo "Logs recentes (últimas 5 linhas):"
echo "======================================"
echo ""
echo "App Log:"
tail -n 5 /opt/ki-aikido-system/logs/app.log 2>/dev/null || echo "Nenhum log disponível"
echo ""
echo "Error Log:"
tail -n 5 /opt/ki-aikido-system/logs/error.log 2>/dev/null || echo "Nenhum erro recente"
echo ""
