# 📅 Guia do Usuário - Sistema de Calendário

## Introdução

O Sistema de Calendário de Eventos do Ki Aikido permite que você visualize, crie e gerencie eventos da federação e do seu dojo de forma centralizada e organizada.

---

## Acessando o Calendário

1. Faça login no sistema
2. Clique no menu **"Calendário"** na barra lateral
3. O calendário será exibido com os eventos do mês atual

**Badge de Notificações**: Um número vermelho ao lado do menu indica quantos avisos importantes você tem.

---

## Visualizações Disponíveis

### 📅 Visualização Mensal (Padrão)

Exibe um calendário tradicional com todos os dias do mês. Os eventos aparecem coloridos de acordo com a categoria:

- 🔴 **Exame** - Vermelho
- 🔵 **Seminário** - Azul
- 🟡 **Aula Especial** - Amarelo
- 🟢 **Aula Regular** - Verde
- 🟣 **Evento Social** - Roxo
- 🌸 **Aviso** - Rosa
- ⚪ **Outro** - Cinza

**Navegação**: Use os botões "Anterior" e "Próximo" para mudar de mês.

### 📋 Visualização em Lista

Exibe todos os eventos em cards detalhados, ordenados por data. Ideal para ver todas as informações de uma vez.

**Como ativar**: Selecione "Lista" no filtro "Visualização".

---

## Filtros

Use o painel lateral para filtrar eventos:

1. **Visualização**: Mês ou Lista
2. **Tipo**: Administrativo ou Dojo
3. **Categoria**: Escolha entre 7 categorias
4. **Status**: Ativo, Suspenso, Cancelado, Concluído
5. **Recorrência**: Eventos únicos ou recorrentes
6. **Dojo**: (Apenas admin) Filtrar por dojo específico
7. **Buscar**: Digite palavras-chave para buscar no título ou descrição

**Limpar Filtros**: Clique no botão "Limpar Filtros" para resetar.

---

## Criando Eventos

### Evento Simples

1. Clique no botão **"+ Novo Evento"** no topo da página
2. Preencha o formulário:
   - **Título**: Nome do evento (obrigatório)
   - **Descrição**: Detalhes adicionais
   - **Tipo**: 
     - Administrativo (apenas admin) - visível para todos
     - Dojo - visível para todos, editável pelo próprio dojo
   - **Dojo**: Selecione o dojo (apenas para eventos de dojo)
   - **Categoria**: Escolha a categoria apropriada
   - **Data/Hora Início e Fim**: Defina quando o evento acontece
   - **Local**: Onde será realizado
   - **Prioridade de Aviso**: Alta, Média ou Baixa
3. Marque "Evento de dia inteiro" se aplicável
4. Marque "Criar avisos padrão" para receber notificações automáticas
5. Clique em **"Salvar"**

### Evento Recorrente (Aulas Regulares)

Para criar aulas que se repetem (ex: toda terça e quinta):

1. Siga os passos 1-4 acima
2. Marque **"Evento recorrente"**
3. Configure a recorrência:
   - **Padrão**: Diariamente, Semanalmente, Mensalmente ou Anualmente
   - **Intervalo**: A cada quantos períodos (ex: 1 = toda semana, 2 = quinzenal)
   - **Dias da Semana**: Marque os dias (para recorrência semanal)
   - **Data de Término**: Até quando o evento se repete
4. Clique em **"Salvar"**

**Exemplo**: Aula toda terça e quinta às 19h
- Tipo: Dojo
- Categoria: Aula Regular
- Início: 2025-11-05 19:00
- Fim: 2025-11-05 20:30
- Recorrente: ✓
- Padrão: Semanalmente
- Dias: Ter ✓ Qui ✓
- Término: 2026-12-31

---

## Visualizando Detalhes

Clique em qualquer evento no calendário ou na lista para ver:

- Informações completas do evento
- Badges de status, tipo e prioridade
- Avisos configurados
- Motivo de suspensão (se aplicável)
- Informações de recorrência (se recorrente)

**Ações Disponíveis**:
- ✏️ **Editar**: Modificar dados do evento
- ⏸️ **Suspender**: Pausar temporariamente
- ▶️ **Reativar**: Reativar evento suspenso
- 🗑️ **Deletar**: Remover permanentemente

---

## Editando Eventos

1. Clique no evento para ver detalhes
2. Clique no ícone de **editar** (lápis)
3. Modifique os campos desejados
4. Clique em **"Atualizar"**

**Permissões**:
- **Admin**: Pode editar qualquer evento
- **Dojo**: Pode editar apenas eventos do próprio dojo

---

## Suspendendo Eventos

Use a suspensão para cancelar temporariamente um evento sem deletá-lo:

1. Abra os detalhes do evento
2. Clique em **"Suspender"**
3. Informe o motivo (ex: "Instrutor em viagem", "Feriado municipal")
4. Confirme

O evento ficará marcado como suspenso (tachado e opaco no calendário) e pode ser reativado a qualquer momento.

### Reativar

1. Abra os detalhes do evento suspenso
2. Clique em **"Reativar"**
3. O evento volta ao status ativo

---

## Sistema de Avisos

### Avisos Automáticos

Quando você marca "Criar avisos padrão" ao criar um evento, o sistema cria automaticamente avisos:
- 7 dias antes do evento
- 3 dias antes do evento
- 1 dia antes do evento
- No dia do evento

### Visualizando Avisos

**Banner no Topo**: Avisos importantes aparecem em um banner vermelho no topo da tela.

**Badge no Menu**: O número ao lado de "Calendário" indica quantos avisos você tem.

**Pop-up ao Login**: (Futuro) Avisos importantes serão exibidos ao fazer login.

### Configurando Avisos Personalizados

Ao criar ou editar um evento, você pode configurar:
- **Prioridade**: Alta (vermelho, pulsante), Média (amarelo) ou Baixa (cinza)
- **Avisos Padrão**: Marque para criar avisos automáticos

---

## Tipos de Eventos

### Eventos Administrativos (Globais)

- Criados apenas por administradores
- Visíveis para todos os usuários
- Não podem ser editados por dojos
- Exemplos: Seminários nacionais, avisos da federação, exames nacionais

### Eventos de Dojo (Locais)

- Criados por admin ou pelo próprio dojo
- Visíveis para todos, editáveis apenas pelo dojo proprietário (e admin)
- Exemplos: Aulas regulares, exames locais, eventos sociais, avisos do dojo

---

## Status dos Eventos

- 🟢 **Ativo**: Evento confirmado e ocorrendo normalmente
- 🟡 **Suspenso**: Temporariamente cancelado, pode ser reativado
- 🔴 **Cancelado**: Cancelamento permanente
- ⚫ **Concluído**: Evento já realizado

---

## Casos de Uso Comuns

### 1. Configurar Aulas Regulares

Se seu dojo tem aulas fixas (ex: terça/quinta 19h, sábado 10h):

1. Crie um evento recorrente para terça/quinta:
   - Título: "Aula Regular - Adultos Noite"
   - Categoria: Aula Regular
   - Recorrente: Semanal, Ter+Qui
   
2. Crie outro evento para sábado:
   - Título: "Aula Regular - Manhã"
   - Categoria: Aula Regular
   - Recorrente: Semanal, Sáb

### 2. Suspender Aulas por Férias

Para suspender aulas durante recesso:

1. Encontre a aula que deseja suspender
2. Clique em "Suspender"
3. Motivo: "Recesso de fim de ano"
4. Repita para todas as aulas do período

**Alternativa**: Crie um evento "Aviso" indicando o período de férias.

### 3. Criar Exame de Graduação

1. Novo Evento
2. Título: "Exame de Graduação - Kyu"
3. Categoria: Exame
4. Prioridade: Alta
5. Avisos padrão: ✓

Os alunos receberão notificações 7, 3 e 1 dia antes do exame.

### 4. Anunciar Evento Especial

1. Novo Evento
2. Categoria: Evento Social ou Seminário
3. Descrição detalhada
4. Prioridade: Média ou Alta
5. Avisos padrão: ✓

---

## Dicas e Boas Práticas

✅ **Use categorias corretas** - Facilita filtros e organização

✅ **Marque eventos importantes como alta prioridade** - Garante que todos vejam

✅ **Use recorrência para aulas fixas** - Evita criar eventos manualmente toda semana

✅ **Suspenda em vez de deletar** - Mantém histórico e pode reativar depois

✅ **Preencha descrições detalhadas** - Ajuda alunos a entender o evento

✅ **Configure avisos** - Reduz ausências e esquecimentos

✅ **Use o campo "Local"** - Especialmente útil para eventos fora do dojo

❌ **Não delete eventos recorrentes sem cuidado** - Afeta todas as ocorrências

❌ **Não crie eventos duplicados** - Use recorrência quando possível

---

## Suporte

Problemas ou dúvidas? Entre em contato com o administrador do sistema.

**Versão**: 1.0  
**Última atualização**: 16 de Outubro de 2025
