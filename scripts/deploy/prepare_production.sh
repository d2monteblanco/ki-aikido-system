#!/bin/bash
# Script para preparar código para deploy em produção
# Faz merge de main para production e valida o código

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "======================================"
echo "Preparando Deploy para Produção"
echo "======================================"
echo ""

# Verificar se está no repositório git
if [ ! -d ".git" ]; then
    echo -e "${RED}Erro: Não está em um repositório git${NC}"
    exit 1
fi

# Verificar se está no branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Branch atual: $CURRENT_BRANCH${NC}"
    echo "Mudando para branch main..."
    git checkout main
fi

# Atualizar branch main
echo -e "${GREEN}[1/6] Atualizando branch main...${NC}"
git pull origin main

# Verificar se há alterações não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Erro: Há alterações não commitadas no branch main${NC}"
    echo "Commit ou descarte as alterações antes de continuar."
    git status
    exit 1
fi

# Verificar sintaxe Python
echo -e "${GREEN}[2/6] Validando código Python...${NC}"
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Compilar arquivos Python para verificar sintaxe
if python3 -m py_compile src/main.py src/models/*.py src/routes/*.py 2>/dev/null; then
    echo -e "${GREEN}✓ Código Python válido${NC}"
else
    echo -e "${RED}✗ Erro de sintaxe no código Python${NC}"
    exit 1
fi
cd ..

# Fazer checkout do branch production
echo -e "${GREEN}[3/6] Mudando para branch production...${NC}"
git fetch origin production
git checkout production

# Atualizar branch production
git pull origin production

# Merge de main para production
echo -e "${GREEN}[4/6] Fazendo merge de main para production...${NC}"
BEFORE_MERGE=$(git rev-parse HEAD)
git merge main --no-edit

AFTER_MERGE=$(git rev-parse HEAD)

if [ "$BEFORE_MERGE" = "$AFTER_MERGE" ]; then
    echo -e "${YELLOW}Nenhuma alteração para fazer merge${NC}"
else
    echo -e "${GREEN}Merge realizado com sucesso!${NC}"
    echo "Commits adicionados:"
    git log --oneline $BEFORE_MERGE..$AFTER_MERGE
fi

# Mostrar diferenças
echo ""
echo -e "${GREEN}[5/6] Resumo das alterações:${NC}"
git diff --stat $BEFORE_MERGE $AFTER_MERGE

# Perguntar se deseja fazer push
echo ""
echo -e "${YELLOW}[6/6] Fazer push para origin/production?${NC}"
read -p "Continuar? (s/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    git push origin production
    echo -e "${GREEN}✓ Push realizado com sucesso!${NC}"
    echo ""
    echo "Próximo passo:"
    echo "1. Conectar à VM via SSH"
    echo "2. cd /opt/ki-aikido-system"
    echo "3. ./scripts/deploy/update_vm.sh"
else
    echo -e "${YELLOW}Push cancelado. Para fazer push manualmente:${NC}"
    echo "  git push origin production"
fi

# Voltar para main
echo ""
echo "Voltando para branch main..."
git checkout main

echo ""
echo -e "${GREEN}======================================"
echo "Preparação concluída!"
echo "======================================${NC}"
echo ""
echo "Branch production está pronto para deploy."
echo ""
