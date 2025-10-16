#!/bin/bash
# =========================================
# Fase 3 - Sistema de Calendário de Eventos
# Script de Testes Completos
# =========================================

echo "=========================================="
echo "  FASE 3 - TESTES DO CALENDÁRIO"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TOTAL=0
PASSED=0
FAILED=0

run_test() {
    local name="$1"
    local cmd="$2"
    local expect="$3"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Test ${TOTAL}: ${name}... "
    
    result=$(eval "$cmd" 2>/dev/null)
    
    if echo "$result" | grep -q "$expect"; then
        echo -e "${GREEN}✓${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Start backend
echo -e "${BLUE}Iniciando backend...${NC}"
cd backend
source venv/bin/activate
python3 src/main.py > /tmp/backend_test.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 5

if ! ps -p $BACKEND_PID > /dev/null; then
    echo -e "${RED}Erro: Backend não iniciou${NC}"
    cat /tmp/backend_test.log
    exit 1
fi

echo -e "${GREEN}Backend iniciado (PID: $BACKEND_PID)${NC}"
echo ""

# Login
echo -e "${YELLOW}=== TESTES DE AUTENTICAÇÃO ===${NC}"
ADMIN_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@kiaikido.com","password":"123456"}' | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
DOJO_TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"florianopolis@kiaikido.com","password":"123456"}' | python3 -c "import json,sys; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

run_test "Login Admin" "echo '$ADMIN_TOKEN'" "eyJ"
run_test "Login Dojo" "echo '$DOJO_TOKEN'" "eyJ"
echo ""

# Listagem e Filtros
echo -e "${YELLOW}=== TESTES DE LISTAGEM E FILTROS ===${NC}"
run_test "Listar todos eventos" "curl -s http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN'" '"total"'
run_test "Filtrar por tipo admin" "curl -s 'http://localhost:5000/api/events?event_type=admin' -H 'Authorization: Bearer $ADMIN_TOKEN'" '"event_type":"admin"'
run_test "Filtrar por categoria exame" "curl -s 'http://localhost:5000/api/events?category=exame' -H 'Authorization: Bearer $ADMIN_TOKEN'" '"category":"exame"'
run_test "Filtrar por status active" "curl -s 'http://localhost:5000/api/events?status=active' -H 'Authorization: Bearer $ADMIN_TOKEN'" '"status":"active"'
run_test "Filtrar eventos recorrentes" "curl -s 'http://localhost:5000/api/events?is_recurring=true' -H 'Authorization: Bearer $ADMIN_TOKEN'" '"is_recurring":true'
run_test "Busca por texto Seminário" "curl -s 'http://localhost:5000/api/events?search=Seminário' -H 'Authorization: Bearer $ADMIN_TOKEN'" 'Seminário'
echo ""

# Criação
echo -e "${YELLOW}=== TESTES DE CRIAÇÃO ===${NC}"
run_test "Admin cria evento admin" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste Admin\",\"category\":\"seminario\",\"event_type\":\"admin\",\"start_datetime\":\"2025-12-01T10:00:00\",\"end_datetime\":\"2025-12-01T12:00:00\"}'" '"message":"Evento criado'
run_test "Dojo cria evento próprio" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $DOJO_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste Dojo\",\"category\":\"aula_regular\",\"event_type\":\"dojo\",\"dojo_id\":1,\"start_datetime\":\"2025-12-03T10:00:00\",\"end_datetime\":\"2025-12-03T12:00:00\"}'" '"message":"Evento criado'
run_test "Dojo NÃO cria admin (deve falhar)" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $DOJO_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Tentativa\",\"category\":\"seminario\",\"event_type\":\"admin\",\"start_datetime\":\"2025-12-04T10:00:00\",\"end_datetime\":\"2025-12-04T12:00:00\"}'" '"error"'
echo ""

# Eventos Recorrentes
echo -e "${YELLOW}=== TESTES DE RECORRÊNCIA ===${NC}"
run_test "Criar recorrente semanal" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Aula Recorrente Teste\",\"category\":\"aula_regular\",\"event_type\":\"dojo\",\"dojo_id\":1,\"start_datetime\":\"2025-11-01T19:00:00\",\"end_datetime\":\"2025-11-01T20:30:00\",\"is_recurring\":true,\"recurrence_pattern\":\"weekly\",\"recurrence_days\":\"2,4\",\"recurrence_end_date\":\"2026-12-31T23:59:59\"}'" '"is_recurring":true'
echo ""

# Edição
echo -e "${YELLOW}=== TESTES DE EDIÇÃO ===${NC}"
EVENT_ID=$(curl -s "http://localhost:5000/api/events?search=Teste+Dojo" -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data['events'][0]['id'] if data.get('events') and len(data['events']) > 0 else 0)" 2>/dev/null)
if [ "$EVENT_ID" != "0" ] && [ "$EVENT_ID" != "" ]; then
    run_test "Editar evento existente" "curl -s -X PUT http://localhost:5000/api/events/$EVENT_ID -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste EDITADO\"}'" '"message":"Evento atualizado'
else
    echo -e "${YELLOW}Test skipped: Edição (evento não encontrado)${NC}"
fi
echo ""

# Suspensão e Reativação
echo -e "${YELLOW}=== TESTES DE SUSPENSÃO ===${NC}"
if [ "$EVENT_ID" != "0" ] && [ "$EVENT_ID" != "" ]; then
    run_test "Suspender evento" "curl -s -X POST http://localhost:5000/api/events/$EVENT_ID/suspend -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"reason\":\"Teste suspensão\"}'" '"status":"suspended"'
    run_test "Reativar evento" "curl -s -X POST http://localhost:5000/api/events/$EVENT_ID/reactivate -H 'Authorization: Bearer $ADMIN_TOKEN'" '"status":"active"'
else
    echo -e "${YELLOW}Tests skipped: Suspensão (evento não encontrado)${NC}"
fi
echo ""

# Avisos
echo -e "${YELLOW}=== TESTES DE AVISOS ===${NC}"
if [ "$EVENT_ID" != "0" ] && [ "$EVENT_ID" != "" ]; then
    run_test "Criar aviso para evento" "curl -s -X POST http://localhost:5000/api/events/$EVENT_ID/reminders -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"days_before\":7,\"reminder_type\":\"banner\",\"message\":\"Teste\"}'" '"message":"Aviso criado'
else
    echo -e "${YELLOW}Test skipped: Avisos (evento não encontrado)${NC}"
fi
run_test "Listar avisos ativos" "curl -s http://localhost:5000/api/events/reminders/active -H 'Authorization: Bearer $ADMIN_TOKEN'" '"reminders"'
echo ""

# Estatísticas
echo -e "${YELLOW}=== TESTES DE ESTATÍSTICAS ===${NC}"
run_test "Estatísticas gerais" "curl -s http://localhost:5000/api/events/statistics -H 'Authorization: Bearer $ADMIN_TOKEN'" '"total_events"'
run_test "Estatísticas por tipo" "curl -s http://localhost:5000/api/events/statistics -H 'Authorization: Bearer $ADMIN_TOKEN'" '"by_type"'
run_test "Estatísticas por categoria" "curl -s http://localhost:5000/api/events/statistics -H 'Authorization: Bearer $ADMIN_TOKEN'" '"by_category"'
echo ""

# Permissões
echo -e "${YELLOW}=== TESTES DE PERMISSÕES ===${NC}"
ADMIN_EVENT=$(curl -s "http://localhost:5000/api/events?event_type=admin" -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data['events'][0]['id'] if data.get('events') and len(data['events']) > 0 else 0)" 2>/dev/null)
if [ "$ADMIN_EVENT" != "0" ] && [ "$ADMIN_EVENT" != "" ]; then
    run_test "Dojo NÃO edita evento admin" "curl -s -X PUT http://localhost:5000/api/events/$ADMIN_EVENT -H 'Authorization: Bearer $DOJO_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Tentativa edição\"}'" '"error"'
    run_test "Dojo NÃO deleta evento admin" "curl -s -X DELETE http://localhost:5000/api/events/$ADMIN_EVENT -H 'Authorization: Bearer $DOJO_TOKEN'" '"error"'
else
    echo -e "${YELLOW}Tests skipped: Permissões (evento admin não encontrado)${NC}"
fi
run_test "Admin pode ver todos eventos" "curl -s http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN'" '"total"'
run_test "Dojo pode ver todos eventos" "curl -s http://localhost:5000/api/events -H 'Authorization: Bearer $DOJO_TOKEN'" '"total"'
echo ""

# Validações
echo -e "${YELLOW}=== TESTES DE VALIDAÇÃO ===${NC}"
run_test "Rejeitar sem título" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"category\":\"outro\",\"event_type\":\"admin\",\"start_datetime\":\"2025-12-01T10:00:00\",\"end_datetime\":\"2025-12-01T12:00:00\"}'" '"error"'
run_test "Rejeitar sem categoria" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste\",\"event_type\":\"admin\",\"start_datetime\":\"2025-12-01T10:00:00\",\"end_datetime\":\"2025-12-01T12:00:00\"}'" '"error"'
run_test "Rejeitar sem tipo" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste\",\"category\":\"outro\",\"start_datetime\":\"2025-12-01T10:00:00\",\"end_datetime\":\"2025-12-01T12:00:00\"}'" '"error"'
run_test "Rejeitar dojo sem dojo_id" "curl -s -X POST http://localhost:5000/api/events -H 'Authorization: Bearer $ADMIN_TOKEN' -H 'Content-Type: application/json' -d '{\"title\":\"Teste\",\"category\":\"outro\",\"event_type\":\"dojo\",\"start_datetime\":\"2025-12-01T10:00:00\",\"end_datetime\":\"2025-12-01T12:00:00\"}'" '"error"'
echo ""

# Deleção
echo -e "${YELLOW}=== TESTES DE DELEÇÃO ===${NC}"
DEL_ID=$(curl -s -X POST http://localhost:5000/api/events -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"title":"Para Deletar","category":"outro","event_type":"admin","start_datetime":"2025-12-20T10:00:00","end_datetime":"2025-12-20T12:00:00"}' | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('event',{}).get('id',''))" 2>/dev/null)
if [ "$DEL_ID" != "" ]; then
    run_test "Deletar evento" "curl -s -X DELETE http://localhost:5000/api/events/$DEL_ID -H 'Authorization: Bearer $ADMIN_TOKEN'" '"message":"Evento deletado'
    run_test "Verificar deletado (404)" "curl -s http://localhost:5000/api/events/$DEL_ID -H 'Authorization: Bearer $ADMIN_TOKEN'" '"error"'
else
    echo -e "${YELLOW}Tests skipped: Deleção (evento não criado)${NC}"
fi
echo ""

# Integração Completa
echo -e "${YELLOW}=== TESTES DE INTEGRAÇÃO ===${NC}"
run_test "Health check backend" "curl -s http://localhost:5000/api/health" '"status":"OK"'
run_test "Listar dojos" "curl -s http://localhost:5000/api/dojos -H 'Authorization: Bearer $ADMIN_TOKEN'" '"dojos"'
run_test "Sistema existente funciona" "curl -s http://localhost:5000/api/students -H 'Authorization: Bearer $ADMIN_TOKEN'" '"students"'
echo ""

# Resultados
echo "=========================================="
echo -e "${BLUE}RESUMO DOS TESTES${NC}"
echo "=========================================="
echo ""
echo "Total de testes: $TOTAL"
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo ""

if [ $TOTAL -gt 0 ]; then
    PERC=$((PASSED * 100 / TOTAL))
    echo "Taxa de sucesso: ${PERC}%"
    echo ""
    
    if [ $PERC -ge 90 ]; then
        echo -e "${GREEN}✓ EXCELENTE! Sistema funcionando perfeitamente.${NC}"
    elif [ $PERC -ge 75 ]; then
        echo -e "${YELLOW}⚠ BOM, mas há alguns problemas.${NC}"
    else
        echo -e "${RED}✗ ATENÇÃO: Muitos testes falharam!${NC}"
    fi
fi

echo ""

# Stop backend
echo -e "${BLUE}Parando backend...${NC}"
kill $BACKEND_PID 2>/dev/null
wait $BACKEND_PID 2>/dev/null

echo -e "${GREEN}Testes concluídos!${NC}"
echo ""

# Exit
if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
