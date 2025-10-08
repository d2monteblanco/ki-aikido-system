#!/bin/bash
# Script de teste para os endpoints de documentos
# Sprint 1 - Sistema de Documentação Física

echo "======================================"
echo "Testes dos Endpoints de Documentos"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base
BASE_URL="http://localhost:5000"
COOKIE_FILE="/tmp/ki_aikido_cookies.txt"

echo -e "${YELLOW}1. Testando Health Endpoint${NC}"
HEALTH=$(curl -s $BASE_URL/api/health)
if echo "$HEALTH" | grep -q "OK"; then
    echo -e "${GREEN}✓ Health endpoint OK${NC}"
else
    echo -e "${RED}✗ Health endpoint falhou${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}2. Fazendo Login (admin)${NC}"
LOGIN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kiaikido.com","password":"123456"}' \
  -c $COOKIE_FILE)

if echo "$LOGIN" | grep -q "Login successful"; then
    echo -e "${GREEN}✓ Login OK${NC}"
else
    echo -e "${RED}✗ Login falhou${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}3. Verificando estrutura do banco de dados${NC}"
cd /home/d2monteblanco/ki-aikido-system/backend
source venv/bin/activate

python3 << 'PYEOF'
from src.main import app, db, MemberStatus, MemberGraduation, MemberQualification, DocumentAttachment

with app.app_context():
    # Verificar colunas
    ms_cols = [c.name for c in MemberStatus.__table__.columns]
    mg_cols = [c.name for c in MemberGraduation.__table__.columns]
    mq_cols = [c.name for c in MemberQualification.__table__.columns]
    da_cols = [c.name for c in DocumentAttachment.__table__.columns]
    
    print("✓ MemberStatus tem photo_path:", "photo_path" in ms_cols)
    print("✓ MemberGraduation tem document_path:", "document_path" in mg_cols)
    print("✓ MemberQualification tem document_path:", "document_path" in mq_cols)
    print("✓ DocumentAttachment existe:", len(da_cols) > 0)
PYEOF

echo ""

echo -e "${YELLOW}4. Criando arquivo de teste (imagem)${NC}"
# Criar uma imagem PNG simples de 1x1 pixel (base64)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_photo.png
echo -e "${GREEN}✓ Arquivo de teste criado: /tmp/test_photo.png${NC}"
echo ""

echo -e "${YELLOW}5. Testando upload sem autenticação (deve falhar)${NC}"
UPLOAD_NO_AUTH=$(curl -s -X POST $BASE_URL/api/documents/upload \
  -F "file=@/tmp/test_photo.png" \
  -F "document_type=member_photo" \
  -F "related_id=1")

if echo "$UPLOAD_NO_AUTH" | grep -q "Não autorizado"; then
    echo -e "${GREEN}✓ Bloqueio de acesso sem autenticação OK${NC}"
else
    echo -e "${RED}✗ Deveria bloquear acesso sem autenticação${NC}"
fi
echo ""

echo -e "${YELLOW}6. Verificando diretório de uploads${NC}"
if [ -d "/home/d2monteblanco/ki-aikido-system/backend/src/uploads/documents" ]; then
    echo -e "${GREEN}✓ Diretório de uploads existe${NC}"
else
    echo -e "${RED}✗ Diretório de uploads não existe${NC}"
fi
echo ""

echo "======================================"
echo -e "${GREEN}Testes básicos concluídos!${NC}"
echo "======================================"
echo ""
echo "Para testes completos de upload:"
echo "1. Inicie o servidor: ./start.sh"
echo "2. Acesse http://localhost:8080"
echo "3. Faça login"
echo "4. Crie/edite um membro e faça upload de foto"
echo ""
echo "Endpoints disponíveis:"
echo "- POST   /api/documents/upload"
echo "- GET    /api/documents/{id}"
echo "- GET    /api/documents/{id}/view"
echo "- GET    /api/documents/by-path/{path}/view"
echo "- DELETE /api/documents/{id}"
echo ""

# Limpar
rm -f /tmp/test_photo.png
rm -f $COOKIE_FILE
