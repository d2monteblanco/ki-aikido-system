#!/bin/bash
# Script não-interativo para commit e push das alterações
set -e

cd /home/d2monteblanco/ki-aikido-system

echo "════════════════════════════════════════════════════════════════"
echo "  INICIANDO COMMIT E PUSH DAS ALTERAÇÕES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Configurar git user
echo "⚙️  Configurando Git..."
git config user.name "Ki Aikido System" 2>/dev/null || true
git config user.email "admin@kiaikido.com" 2>/dev/null || true

echo ""
echo "📋 Arquivos modificados/novos:"
echo "────────────────────────────────────────────────────────────────"
git status --short
echo ""

echo "📊 Estatísticas de alterações:"
echo "────────────────────────────────────────────────────────────────"
git diff --stat || echo "(Arquivos não rastreados ou já no stage)"
echo ""

echo "➕ Adicionando todos os arquivos ao stage..."
git add -A

echo ""
echo "📋 Arquivos preparados para commit:"
echo "────────────────────────────────────────────────────────────────"
git status --short
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
- test_constants.py
- check-and-commit.sh
- auto-commit-push.sh" 2>&1

COMMIT_STATUS=$?

if [ $COMMIT_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Commit realizado com sucesso!"
    echo ""
    echo "🚀 Fazendo push para origin main..."
    git push origin main 2>&1
    
    PUSH_STATUS=$?
    
    if [ $PUSH_STATUS -eq 0 ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════"
        echo "  ✅ PUSH REALIZADO COM SUCESSO!"
        echo "════════════════════════════════════════════════════════════════"
        echo ""
        echo "📊 Últimos 5 commits:"
        echo "────────────────────────────────────────────────────────────────"
        git log --oneline --graph -5
        echo ""
        echo "🌐 Repositório:"
        echo "────────────────────────────────────────────────────────────────"
        git remote -v
        echo ""
        echo "🌿 Branch atual:"
        echo "────────────────────────────────────────────────────────────────"
        git branch -v
        echo ""
    else
        echo ""
        echo "❌ Erro ao fazer push!"
        echo ""
        echo "Possíveis causas:"
        echo "  - Sem permissão para push"
        echo "  - Remote não configurado corretamente"
        echo "  - Conflitos com remote"
        echo "  - Credenciais necessárias"
        echo ""
        echo "🌐 Remote configurado:"
        git remote -v
        echo ""
        echo "Para fazer push manualmente:"
        echo "  cd /home/d2monteblanco/ki-aikido-system"
        echo "  git push origin main"
        exit 1
    fi
else
    # Verificar se não há nada para commitar
    if git diff --cached --quiet; then
        echo ""
        echo "ℹ️  Nenhuma alteração para commitar"
        echo ""
        echo "Status atual:"
        git status
        exit 0
    else
        echo ""
        echo "❌ Erro ao fazer commit!"
        echo ""
        echo "Verifique o status:"
        git status
        exit 1
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ OPERAÇÃO CONCLUÍDA COM SUCESSO!"
echo "════════════════════════════════════════════════════════════════"
echo ""
