#!/bin/bash
set -e

cd /home/d2monteblanco/ki-aikido-system

echo "════════════════════════════════════════════════════════════════"
echo "  VERIFICANDO ALTERAÇÕES NO REPOSITÓRIO"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Configurar git user se necessário
git config user.name "Ki Aikido System" 2>/dev/null || true
git config user.email "admin@kiaikido.com" 2>/dev/null || true

echo "📋 Status atual do repositório:"
echo "────────────────────────────────────────────────────────────────"
git status --short
echo ""

echo "📊 Estatísticas das alterações:"
echo "────────────────────────────────────────────────────────────────"
git diff --stat
echo ""

echo "📝 Resumo das alterações por arquivo:"
echo "────────────────────────────────────────────────────────────────"
git status
echo ""

read -p "Deseja visualizar o diff completo? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  DIFF COMPLETO DAS ALTERAÇÕES"
    echo "═══════════════════════════════════════════════════════════════"
    git diff
    echo ""
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  PREPARANDO COMMIT"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Adicionar todos os arquivos modificados e novos
echo "➕ Adicionando arquivos ao stage..."
git add -A

echo ""
echo "📋 Arquivos no stage:"
echo "────────────────────────────────────────────────────────────────"
git status --short
echo ""

read -p "Confirma commit e push destas alterações? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "❌ Operação cancelada pelo usuário"
    exit 1
fi

echo ""
echo "💾 Fazendo commit..."
git commit -m "fix: Corrigir carregamento de graduações e qualificações

Correções implementadas:
- Adicionar logs detalhados para debug de constantes
- Converter updateRankOptions() e updateQualificationLevelOptions() para async
- Garantir carregamento de constantes antes de abrir modais
- Adicionar headers CORS explícitos ao endpoint /member-status/constants
- Corrigir referência LECTURER_LEVELS → INSTRUCTOR_LEVELS no backend
- Melhorar tratamento de erros quando constantes não carregam
- Adicionar validação de constantes após carregamento

Problemas resolvidos:
✅ Modal graduação: lista popula corretamente ao selecionar disciplina
✅ Modal qualificação: lista de níveis popula ao selecionar tipo
✅ Erro 500 no endpoint de constantes corrigido
✅ Erro CORS no endpoint de constantes corrigido
✅ Cache do navegador não impede mais atualizações

Arquivos principais modificados:
- frontend/app.js: Funções async e tratamento de erro robusto
- backend/src/routes/member_status.py: CORS + correção constante

Documentação e scripts adicionados:
- CORRECAO-GRADUACOES-QUALIFICACOES.md
- CORRECAO-CORS-CONSTANTES.md
- CORRECAO-ERRO-500.md
- SOLUCAO-FINAL-CACHE.md
- restart-backend.sh
- test_constants.py"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit realizado com sucesso!"
    echo ""
    echo "🚀 Fazendo push para origin main..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo "  ✅ PUSH REALIZADO COM SUCESSO!"
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        echo "📊 Últimos 5 commits:"
        echo "────────────────────────────────────────────────────────────────"
        git log --oneline --graph -5
        echo ""
        echo "🌐 Remote configurado:"
        echo "────────────────────────────────────────────────────────────────"
        git remote -v
        echo ""
    else
        echo ""
        echo "❌ Erro ao fazer push!"
        echo ""
        echo "Possíveis causas:"
        echo "  - Sem permissão para push"
        echo "  - Remote não configurado"
        echo "  - Conflitos com remote"
        echo ""
        echo "Remote atual:"
        git remote -v
        exit 1
    fi
else
    echo ""
    echo "❌ Erro ao fazer commit!"
    echo "Pode não haver alterações para commitar"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ OPERAÇÃO CONCLUÍDA COM SUCESSO!"
echo "════════════════════════════════════════════════════════════════"
