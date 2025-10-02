#!/bin/bash
set -e

cd /home/d2monteblanco/ki-aikido-system

echo "════════════════════════════════════════════════════════════════"
echo "  VERIFICANDO ALTERAÇÕES NO REPOSITÓRIO"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Configurar git user se necessário
git config user.name "Ki Aikido System" 2>/dev/null || true
git config user.email "d2monteblanco@gmail.com" 2>/dev/null || true

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
git commit -m "feat: Implementar modais de detalhes somente leitura para Membros e Cadastros Básicos

   Implementados modais de visualização completa em modo somente leitura, separando
   corretamente as responsabilidades entre Cadastro Básico e Membro.

    Principais Alterações

     Frontend app.js, index.html
   - Adicionado modal de detalhes do Cadastro Básico studentDetailsModal
     - Exibe todas informações pessoais do estudante
     - Mostra resumo do registro de membro quando existir
     - Link para navegar aos detalhes completos do membro

   - Adicionado modal de detalhes do Membro memberDetailsModal
     - Exibe informações de referência nome, dojo, registro
     - Mostra status completo de membro
     - Lista histórico completo de graduações
     - Lista todas as qualificações

   - Corrigido autenticação nas requisições credentials: include
   - Implementado extração de dados aninhados da API
   - Adicionado carregamento automático da lista ao navegar entre modais

     Backend member_status.py
   - Atualizado método to_summary para incluir:
     - membership_date data de filiação
     - current_status_display tradução do status

     Funcionalidades
   - Botão Visualizar olho azul abre modal somente leitura
   - Botão Editar lápis verde mantém funcionalidade de edição
   - Navegação fluida entre modais de Cadastro Básico e Membro
   - Todos os dados exibidos corretamente sem N/A incorretos
   - Lista de membros carrega automaticamente ao navegar

   Resolve separação de contextos e melhora UX de visualização de dados.
"

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
