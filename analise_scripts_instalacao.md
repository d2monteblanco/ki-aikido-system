# Análise dos Scripts de Instalação - Sistema Ki Aikido

## 🔍 Problemas Identificados

### 1. **Referências ao arquivo obsoleto**
- Scripts ainda referenciam `ki-aikido-simple.html` que foi removido
- Deve referenciar `ki-aikido-enhanced.html`

### 2. **Caminho do banco de dados inconsistente**
- Script de instalação: `$BACKEND_DIR/database/app.db`
- Script de start: `$BACKEND_DIR/src/database/app.db`
- Aplicação real: `backend/src/database/app.db`

### 3. **Função de inicialização do banco**
- Scripts chamam `init_database()` que pode não existir
- Deve usar `init_db()` ou verificar função correta

### 4. **Migração de novas tabelas**
- Scripts não executam as migrações das novas tabelas de membros
- Falta execução do script `add_member_status_tables.py`

### 5. **Configuração de porta**
- Scripts usam porta 5000 mas sistema atual roda na 5001
- Inconsistência entre configuração e execução

### 6. **Dependências do sistema**
- Pode faltar algumas dependências Python específicas
- Verificar se todas as dependências estão no requirements.txt

## 🎯 Correções Necessárias

### 1. **Atualizar referências do frontend**
- Trocar `ki-aikido-simple.html` por `ki-aikido-enhanced.html`

### 2. **Padronizar caminhos do banco**
- Usar sempre `backend/src/database/app.db`

### 3. **Corrigir inicialização do banco**
- Verificar função correta de inicialização
- Adicionar execução das migrações

### 4. **Configurar porta correta**
- Definir porta padrão (5000 ou 5001)
- Manter consistência em todos os scripts

### 5. **Melhorar tratamento de erros**
- Adicionar mais verificações de dependências
- Melhorar mensagens de erro

## 📋 Testes Necessários

1. Testar instalação em ambiente limpo
2. Verificar inicialização do banco de dados
3. Testar scripts de start/stop/status
4. Verificar se todas as dependências são instaladas
5. Testar processo de atualização

