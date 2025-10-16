# 📅 Projeto: Sistema de Calendário de Eventos - Ki Aikido

## 🎯 Visão Geral

Sistema de gerenciamento de eventos e agenda para academias Ki Aikido, permitindo a visualização centralizada de eventos administrativos e de dojos com controle de acesso granular e interface amigável.

---

## 📋 Requisitos Funcionais

### 1. Tipos de Eventos

#### 1.1 Eventos de Administração (Nivel Global)
- **Visibilidade**: Todos os usuários (admin e dojos)
- **Edição**: Apenas administradores
- **Exemplos**:
  - Avisos gerais da federação
  - Eventos nacionais/regionais
  - Seminários com instrutores convidados
  - Datas importantes do calendário Ki Aikido Brasil
  - Mudanças de políticas ou regulamentos

#### 1.2 Eventos de Dojo (Nivel Local)
- **Visibilidade**: Todos os usuários podem visualizar eventos de qualquer dojo
- **Edição**: Cada dojo pode editar apenas seus próprios eventos
- **Administradores**: Podem editar eventos de qualquer dojo
- **Exemplos**:
  - Exames de graduação
  - Aulas especiais
  - Treinos programados
  - Eventos sociais do dojo
  - Férias e suspensão de aulas

### 2. Sistema de Avisos e Alarmes

#### 2.1 Avisos de Eventos
- **Avisos Automáticos**: Notificações no site para eventos importantes
- **Pré-configurações**: 
  - 1 semana antes do evento
  - 3 dias antes do evento
  - 1 dia antes do evento
  - No dia do evento
- **Customização**: Admin e dojos podem configurar avisos personalizados
- **Tipos de Aviso**:
  - Banner no topo do site
  - Badge de notificação no menu
  - Pop-up ao fazer login
  - Destaque no calendário

#### 2.2 Prioridades de Avisos
- **Alta**: Exames, eventos nacionais, seminários importantes
- **Média**: Aulas especiais, eventos sociais
- **Baixa**: Avisos gerais, comunicados informativos

### 3. Eventos Repetitivos

#### 3.1 Tipos de Recorrência
- **Aulas Regulares**: Configuração de aulas fixas
  - Exemplos: Terças e quintas às 19h, Sábados às 10h
  - Múltiplos horários por dia da semana
  - Configuração de horário de início e fim
  
- **Eventos Anuais**: Repetição anual na mesma data
  - Exemplos: Aniversário do dojo, data comemorativa da federação
  - Opção de ajuste automático para dia útil mais próximo
  
- **Eventos Semanais/Mensais**: Padrões customizados
  - Toda segunda-feira
  - Primeira sexta de cada mês
  - Último sábado do mês

#### 3.2 Gerenciamento de Séries
- **Edição Individual**: Alterar apenas uma ocorrência
- **Edição em Série**: Atualizar todas as ocorrências futuras
- **Edição Retroativa**: Atualizar série completa (incluindo passado)
- **Exceções**: Marcar datas específicas como exceção sem quebrar a série

### 4. Suspensão Temporária de Eventos

#### 4.1 Status de Eventos
- **Ativo**: Evento confirmado e ocorrendo normalmente
- **Suspenso**: Temporariamente cancelado, pode ser reativado
- **Cancelado**: Cancelamento permanente/definitivo
- **Concluído**: Evento já realizado

#### 4.2 Suspensão de Aulas
- **Suspensão Pontual**: Cancelar aula de um dia específico
- **Suspensão por Período**: Suspender aulas por intervalo de datas
  - Exemplos: Férias, recesso, reforma do dojo
- **Motivos de Suspensão**: Registrar razão (férias, feriado, evento especial, etc.)
- **Reativação Fácil**: Restaurar eventos suspensos com um clique

#### 4.3 Controle de Suspensão
- **Visualização no Calendário**: Eventos suspensos com estilo diferenciado (tachado, opacidade reduzida)
- **Histórico**: Registro de todas as suspensões e reativações
- **Avisos**: Notificar alunos sobre aulas suspensas

### 5. Controle de Acesso

| Tipo de Usuário | Criar Admin | Editar Admin | Criar Dojo | Editar Dojo | Visualizar Todos |
|-----------------|-------------|--------------|------------|-------------|------------------|
| **Administrador** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dojo** | ❌ | ❌ | ✅ (próprio) | ✅ (próprio) | ✅ |

### 6. Sistema de Filtros

Inspirado no sistema de filtros da página de membros, deve incluir:

#### 6.1 Filtros Básicos
- **Tipo de Evento**: Administrativo / Dojo / Aula Regular
- **Dojo**: Seleção múltipla de dojos (todos por padrão)
- **Período**: Data inicial e final
- **Categoria**: Exame / Seminário / Aula Especial / Aula Regular / Evento Social / Aviso / Outro

#### 6.2 Filtros Avançados
- **Status**: Ativo / Suspenso / Cancelado / Concluído / Pendente
- **Recorrência**: Único / Recorrente / Série
- **Período Rápido**: Hoje / Esta Semana / Este Mês / Próximos 3 Meses / Este Ano
- **Pesquisa**: Busca por título ou descrição
- **Avisos Ativos**: Mostrar apenas eventos com avisos programados

#### 6.3 Ordenação
- Data (crescente/decrescente)
- Título (A-Z / Z-A)
- Tipo de evento
- Dojo
- Prioridade de aviso

---

## 🗂️ Estrutura de Dados

### Modelo: Event

```python
class Event(db.Model):
    """Modelo para eventos do calendário"""
    
    # Identificação
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Tipo e Categoria
    event_type = db.Column(db.String(20), nullable=False)  # 'admin', 'dojo', 'class'
    category = db.Column(db.String(50), nullable=False)  # 'exam', 'seminar', 'class', 'regular_class', 'social', 'notice', 'other'
    
    # Datas e Horários
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)  # Null para eventos de dia único
    all_day = db.Column(db.Boolean, default=False)  # Evento de dia inteiro
    
    # Localização
    location = db.Column(db.String(200), nullable=True)
    dojo_id = db.Column(db.Integer, db.ForeignKey('dojo.id'), nullable=True)  # Null para eventos admin
    
    # Status e Controle
    status = db.Column(db.String(20), default='active')  # 'active', 'suspended', 'cancelled', 'completed', 'pending'
    suspension_reason = db.Column(db.String(200), nullable=True)  # Motivo da suspensão
    suspension_date = db.Column(db.DateTime, nullable=True)  # Data da suspensão
    color = db.Column(db.String(7), nullable=True)  # Código HEX para cor no calendário
    
    # Recorrência
    is_recurring = db.Column(db.Boolean, default=False)  # Se é evento recorrente
    recurrence_type = db.Column(db.String(20), nullable=True)  # 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_pattern = db.Column(db.JSON, nullable=True)  # Padrão de recorrência (dias da semana, etc)
    recurrence_end_date = db.Column(db.DateTime, nullable=True)  # Data final da série
    parent_event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)  # ID do evento pai (série)
    is_exception = db.Column(db.Boolean, default=False)  # Se é exceção na série
    
    # Sistema de Avisos
    has_reminder = db.Column(db.Boolean, default=False)  # Se tem avisos configurados
    reminder_settings = db.Column(db.JSON, nullable=True)  # Configurações de avisos
    reminder_priority = db.Column(db.String(20), default='medium')  # 'high', 'medium', 'low'
    show_banner = db.Column(db.Boolean, default=False)  # Mostrar banner no site
    
    # Participantes e Visibilidade
    max_participants = db.Column(db.Integer, nullable=True)  # Null = sem limite
    is_public = db.Column(db.Boolean, default=True)  # Visível no calendário público
    requires_registration = db.Column(db.Boolean, default=False)  # Requer inscrição
    
    # Notas e Anexos
    notes = db.Column(db.Text, nullable=True)
    attachment_url = db.Column(db.String(500), nullable=True)  # Link para documento/imagem
    
    # Auditoria
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    dojo = db.relationship('Dojo', backref='events')
    creator = db.relationship('User', backref='created_events')
    child_events = db.relationship('Event', backref=db.backref('parent_event', remote_side=[id]))
```

### Modelo: EventReminder

```python
class EventReminder(db.Model):
    """Modelo para avisos/lembretes de eventos"""
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    
    # Configuração do Aviso
    reminder_type = db.Column(db.String(20), nullable=False)  # 'banner', 'notification', 'popup', 'badge'
    days_before = db.Column(db.Integer, nullable=False)  # Quantos dias antes avisar
    trigger_date = db.Column(db.DateTime, nullable=False)  # Data que o aviso será disparado
    
    # Status
    is_sent = db.Column(db.Boolean, default=False)  # Se já foi enviado/exibido
    sent_at = db.Column(db.DateTime, nullable=True)
    
    # Mensagem Customizada
    custom_message = db.Column(db.Text, nullable=True)
    
    # Auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento
    event = db.relationship('Event', backref='reminders')
```

### Padrões de Recorrência (JSON)

```python
# Exemplo: Aulas terças e quintas às 19h
recurrence_pattern = {
    'type': 'weekly',
    'days_of_week': [2, 4],  # 0=Dom, 1=Seg, 2=Ter, ..., 6=Sáb
    'time': '19:00',
    'duration_minutes': 90
}

# Exemplo: Aulas terça, quinta e sábado
recurrence_pattern = {
    'type': 'weekly',
    'days_of_week': [2, 4, 6],
    'times': {
        2: '19:00',  # Terça às 19h
        4: '19:00',  # Quinta às 19h
        6: '10:00'   # Sábado às 10h
    },
    'duration_minutes': 90
}

# Exemplo: Todo dia 15 do mês
recurrence_pattern = {
    'type': 'monthly',
    'day_of_month': 15,
    'time': '14:00'
}

# Exemplo: Aniversário do dojo (todo ano)
recurrence_pattern = {
    'type': 'yearly',
    'month': 3,
    'day': 20,
    'adjust_to_weekday': true  # Ajusta para dia útil se cair em fim de semana
}

# Exemplo: Primeira sexta do mês
recurrence_pattern = {
    'type': 'monthly',
    'week_of_month': 1,  # Primeira semana
    'day_of_week': 5,    # Sexta-feira
    'time': '20:00'
}
```

### Configurações de Avisos (JSON)

```python
reminder_settings = {
    'auto_reminders': [
        {'days_before': 7, 'type': 'badge'},
        {'days_before': 3, 'type': 'notification'},
        {'days_before': 1, 'type': 'popup'},
        {'days_before': 0, 'type': 'banner'}
    ],
    'custom_message': 'Lembrete: Exame de graduação',
    'notify_users': ['all', 'dojo_members', 'admins']  # Quem deve ser notificado
}
```

### Categorias de Eventos

```python
EVENT_CATEGORIES = {
    'exam': {
        'label': 'Exame de Graduação',
        'icon': 'fa-graduation-cap',
        'color': '#DC2626'  # Vermelho
    },
    'seminar': {
        'label': 'Seminário',
        'icon': 'fa-users',
        'color': '#7C3AED'  # Roxo
    },
    'class': {
        'label': 'Aula Especial',
        'icon': 'fa-chalkboard-teacher',
        'color': '#2563EB'  # Azul
    },
    'regular_class': {
        'label': 'Aula Regular',
        'icon': 'fa-calendar-check',
        'color': '#0891B2'  # Ciano
    },
    'social': {
        'label': 'Evento Social',
        'icon': 'fa-calendar-heart',
        'color': '#059669'  # Verde
    },
    'notice': {
        'label': 'Aviso/Comunicado',
        'icon': 'fa-bullhorn',
        'color': '#D97706'  # Laranja
    },
    'vacation': {
        'label': 'Férias/Recesso',
        'icon': 'fa-umbrella-beach',
        'color': '#64748B'  # Cinza
    },
    'other': {
        'label': 'Outro',
        'icon': 'fa-circle',
        'color': '#6B7280'  # Cinza escuro
    }
}

EVENT_STATUS = {
    'active': {
        'label': 'Ativo',
        'color': '#059669',  # Verde
        'icon': 'fa-check-circle'
    },
    'suspended': {
        'label': 'Suspenso',
        'color': '#F59E0B',  # Amarelo
        'icon': 'fa-pause-circle'
    },
    'cancelled': {
        'label': 'Cancelado',
        'color': '#DC2626',  # Vermelho
        'icon': 'fa-times-circle'
    },
    'completed': {
        'label': 'Concluído',
        'color': '#6B7280',  # Cinza
        'icon': 'fa-check-double'
    },
    'pending': {
        'label': 'Pendente',
        'color': '#3B82F6',  # Azul
        'icon': 'fa-clock'
    }
}

REMINDER_TYPES = {
    'banner': 'Banner no topo',
    'notification': 'Notificação',
    'popup': 'Pop-up ao login',
    'badge': 'Badge no menu'
}

REMINDER_PRIORITIES = {
    'high': {
        'label': 'Alta',
        'color': '#DC2626',
        'icon': 'fa-exclamation-circle'
    },
    'medium': {
        'label': 'Média',
        'color': '#F59E0B',
        'icon': 'fa-info-circle'
    },
    'low': {
        'label': 'Baixa',
        'color': '#3B82F6',
        'icon': 'fa-bell'
    }
}
```

---

## �� Interface do Usuário

### 1. Visualizações do Calendário

#### 1.1 Visualização Mensal (Padrão)
- Grid de calendário estilo tradicional
- Navegação entre meses com setas
- Eventos mostrados como badges coloridos nos dias
- Indicador visual de múltiplos eventos no mesmo dia
- Click no dia para ver detalhes

#### 1.2 Visualização Semanal
- Visão detalhada de 7 dias
- Horários visíveis (grade horária)
- Ideal para planejar semana de treinos
- Eventos com duração visual (blocos)

#### 1.3 Visualização em Lista
- Todos os eventos em ordem cronológica
- Filtros e busca mais evidentes
- Melhor para visualização de muitos eventos
- Paginação e scroll infinito
- Indicadores visuais de status (ativo, suspenso, cancelado)
- Badges de recorrência e avisos

#### 1.4 Sistema de Avisos no Site
- **Banner no Topo**: Barra colorida com eventos importantes
- **Badge de Notificação**: Contador de avisos no ícone do calendário
- **Pop-up ao Login**: Lembretes ao acessar o sistema
- **Cores por Prioridade**:
  - Vermelho: Alta prioridade
  - Laranja: Média prioridade
  - Azul: Baixa prioridade

### 2. Card de Evento

Componente visual para exibir eventos com:
- Ícone da categoria
- Título do evento
- Data e horário
- Local / Dojo
- Status visual (badge colorido)
- Indicador de recorrência (ícone de repetição)
- Indicador de avisos ativos
- Botões de ação (editar, suspender, deletar, reativar)
- Indicador de permissões

### 3. Painel de Filtros

Sistema de filtros lateral ou em modal com:
- Checkboxes para tipos e categorias
- Multi-select para dojos
- Date pickers para períodos
- Filtros rápidos (botões)
- Contador de filtros ativos
- Botão limpar filtros

---

## 🔌 Endpoints da API

### Base URL: `/api/events`

#### 1. Listar Eventos
```http
GET /api/events
```

**Query Parameters:**
- `page` (int): Número da página
- `per_page` (int): Eventos por página (padrão: 50)
- `event_type` (string): 'admin', 'dojo', 'class', ou vazio
- `dojo_id` (int): ID do dojo (múltiplos separados por vírgula)
- `category` (string): Categoria do evento
- `status` (string): 'active', 'suspended', 'cancelled', 'completed', 'pending'
- `start_date` (string): Data inicial (YYYY-MM-DD)
- `end_date` (string): Data final (YYYY-MM-DD)
- `search` (string): Busca em título e descrição
- `is_recurring` (bool): Filtrar eventos recorrentes
- `has_reminder` (bool): Filtrar eventos com avisos ativos

**Response (200):**
```json
{
  "events": [
    {
      "id": 1,
      "title": "Exame de Graduação Semestral",
      "description": "Exame de faixas...",
      "event_type": "dojo",
      "category": "exam",
      "start_date": "2025-10-15T14:00:00",
      "end_date": "2025-10-15T18:00:00",
      "all_day": false,
      "location": "Dojo Florianópolis",
      "dojo_id": 1,
      "dojo_name": "Florianópolis",
      "status": "active",
      "suspension_reason": null,
      "color": "#DC2626",
      "is_recurring": false,
      "recurrence_type": null,
      "parent_event_id": null,
      "has_reminder": true,
      "reminder_priority": "high",
      "show_banner": true,
      "max_participants": 30,
      "current_participants": 20,
      "is_public": true,
      "requires_registration": true,
      "created_by": 2,
      "creator_name": "João Silva",
      "can_edit": true,
      "can_delete": true,
      "can_suspend": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 45,
    "pages": 1
  }
}
```

#### 2. Obter Evento Específico
```http
GET /api/events/<int:event_id>
```

#### 3. Criar Evento
```http
POST /api/events
```

**Request Body:**
```json
{
  "title": "Seminário de Ki",
  "description": "Seminário especial...",
  "event_type": "dojo",
  "category": "seminar",
  "start_date": "2025-11-20T10:00:00",
  "end_date": "2025-11-20T17:00:00",
  "dojo_id": 1,
  "status": "confirmed",
  "max_participants": 40
}
```

#### 4. Atualizar Evento
```http
PUT /api/events/<int:event_id>
```

#### 5. Deletar Evento
```http
DELETE /api/events/<int:event_id>
```

**Query Parameters (opcional para eventos recorrentes):**
- `delete_series` (bool): Se true, deleta toda a série de eventos recorrentes

#### 6. Suspender Evento
```http
POST /api/events/<int:event_id>/suspend
```

**Request Body:**
```json
{
  "reason": "Feriado municipal",
  "suspend_series": false  // Se true, suspende toda série de eventos recorrentes
}
```

#### 7. Reativar Evento Suspenso
```http
POST /api/events/<int:event_id>/reactivate
```

#### 8. Criar Evento Recorrente
```http
POST /api/events/recurring
```

**Request Body (exemplo de aula semanal):**
```json
{
  "title": "Aula Regular - Adultos",
  "description": "Aula de aikido para adultos",
  "event_type": "class",
  "category": "regular_class",
  "dojo_id": 1,
  "location": "Dojo Florianópolis",
  "is_recurring": true,
  "recurrence_type": "weekly",
  "recurrence_pattern": {
    "type": "weekly",
    "days_of_week": [2, 4, 6],
    "times": {
      "2": "19:00",
      "4": "19:00",
      "6": "10:00"
    },
    "duration_minutes": 90
  },
  "recurrence_end_date": "2026-12-31T23:59:59",
  "has_reminder": true,
  "reminder_settings": {
    "auto_reminders": [
      {"days_before": 1, "type": "notification"}
    ]
  }
}
```

#### 9. Editar Série de Eventos
```http
PUT /api/events/<int:event_id>/series
```

**Query Parameters:**
- `edit_mode` (string): 'this_only', 'this_and_following', 'all'

#### 10. Configurar Avisos
```http
POST /api/events/<int:event_id>/reminders
```

**Request Body:**
```json
{
  "reminder_priority": "high",
  "show_banner": true,
  "reminder_settings": {
    "auto_reminders": [
      {"days_before": 7, "type": "badge"},
      {"days_before": 3, "type": "notification"},
      {"days_before": 1, "type": "popup"},
      {"days_before": 0, "type": "banner"}
    ],
    "custom_message": "Lembrete importante: Exame de graduação",
    "notify_users": ["all"]
  }
}
```

#### 11. Obter Avisos Ativos
```http
GET /api/events/reminders/active
```

**Response (200):**
```json
{
  "reminders": [
    {
      "id": 1,
      "event_id": 5,
      "event_title": "Exame de Graduação",
      "event_date": "2025-10-20T14:00:00",
      "reminder_type": "banner",
      "priority": "high",
      "message": "Exame de graduação em 3 dias!",
      "days_until": 3
    }
  ]
}
```

#### 12. Estatísticas
```http
GET /api/events/statistics
```

---

## 📁 Estrutura de Arquivos

### Backend

```
backend/src/
├── models/
│   ├── __init__.py              # Atualizar com Event e EventReminder
│   ├── event.py                 # NOVO: Modelo Event
│   └── event_reminder.py        # NOVO: Modelo EventReminder
│
└── routes/
    ├── __init__.py              # Registrar blueprint
    └── events.py                # NOVO: Endpoints de eventos e avisos
```

### Frontend

```
frontend/
├── index.html                   # Adicionar seção de calendário
├── app.js                       # Adicionar funções de eventos
├── calendar.js                  # NOVO: Lógica do calendário
└── css/
    └── calendar.css             # NOVO: Estilos do calendário
```

---

## 🔧 Implementação Técnica

### Fase 1: Backend (3-4 dias)

**Passo 1.1**: Criar modelos
- Arquivo: `backend/src/models/event.py` - Modelo Event
- Arquivo: `backend/src/models/event_reminder.py` - Modelo EventReminder
- Definir classes com todos os campos
- Adicionar métodos to_dict(), validações
- Relacionamentos com Dojo e User
- Métodos para gerenciar recorrência

**Passo 1.2**: Atualizar models/__init__.py
- Importar Event e EventReminder
- Adicionar ao __all__

**Passo 1.3**: Criar routes/events.py
- Implementar todos os endpoints
- Controle de acesso (admin vs dojo)
- Filtros e paginação
- Validações
- Lógica de eventos recorrentes
- Sistema de suspensão/reativação
- Gerenciamento de avisos

**Passo 1.4**: Registrar blueprint
- Em main.py, registrar events_bp

**Passo 1.5**: Atualizar database
- Rodar init_database()
- Criar dados de demonstração (eventos únicos e recorrentes)
- Criar avisos de exemplo

### Fase 2: Frontend - Estrutura (2 dias)

**Passo 2.1**: Adicionar ao menu
- Botão "Calendário" no sidebar

**Passo 2.2**: Criar tela HTML
- Section #calendarScreen
- Estrutura do calendário
- Modais de evento

**Passo 2.3**: JavaScript base
- Funções de API
- Renderização básica
- Gestão de estado

### Fase 3: Visualizações (3 dias)

**Passo 3.1**: Vista mensal
- Grid de calendário
- Navegação entre meses
- Indicadores de eventos

**Passo 3.2**: Vista semanal
- Grade horária
- Blocos de eventos
- Navegação entre semanas

**Passo 3.3**: Vista em lista
- Lista paginada
- Filtros integrados
- Ordenação

### Fase 4: Funcionalidades Avançadas (3 dias)

**Passo 4.1**: Sistema de filtros
- Multi-select dojos
- Filtros de categoria e status
- Filtros de recorrência
- Busca por texto
- Período rápido
- Filtro de avisos ativos

**Passo 4.2**: Eventos recorrentes
- Interface para criar séries
- Seleção de dias da semana
- Configuração de horários múltiplos
- Preview de ocorrências
- Edição individual vs série
- Gerenciamento de exceções

**Passo 4.3**: Sistema de suspensão
- Suspender evento pontual
- Suspender série de eventos
- Suspender por período
- Modal com motivo de suspensão
- Reativar eventos suspensos
- Visualização de histórico

**Passo 4.4**: Sistema de avisos
- Configurar avisos por evento
- Definir prioridade
- Escolher tipo de aviso (banner, popup, badge, notificação)
- Configurar dias de antecedência
- Banner de avisos no topo do site
- Badge de contador no menu
- Pop-up ao fazer login
- Marcar avisos como lidos

**Passo 4.2**: CRUD de eventos
- Modal de criação (com opções de recorrência)
- Modal de edição (individual ou série)
- Confirmação de deleção (individual ou série)
- Validações

**Passo 4.3**: Permissões
- Verificar role do usuário
- Mostrar/ocultar botões
- Validar ações

### Fase 5: Polimento e Testes (2-3 dias)

**Passo 5.1**: Responsividade
- Mobile-first
- Adaptação de vistas
- Touch gestures

**Passo 5.2**: UX
- Loading states
- Notificações de sucesso/erro
- Confirmações para ações críticas
- Animações suaves

**Passo 5.3**: Testes
- Testar endpoints
- Testar permissões
- Testar filtros
- Testar eventos recorrentes
- Testar suspensão/reativação
- Testar sistema de avisos
- Validar responsividade

---

## 🎨 Paleta de Cores

```css
/* Eventos por Categoria */
.event-exam { background-color: #DC2626; color: white; }
.event-seminar { background-color: #7C3AED; color: white; }
.event-class { background-color: #2563EB; color: white; }
.event-regular-class { background-color: #0891B2; color: white; }
.event-social { background-color: #059669; color: white; }
.event-notice { background-color: #D97706; color: white; }
.event-vacation { background-color: #64748B; color: white; }
.event-other { background-color: #6B7280; color: white; }

/* Eventos por Tipo */
.event-admin-border { border-left: 4px solid #DC2626; }
.event-dojo-border { border-left: 4px solid #2563EB; }
.event-class-border { border-left: 4px solid #0891B2; }

/* Status */
.status-active { border: 2px solid #059669; }
.status-suspended { 
  border: 2px solid #F59E0B; 
  opacity: 0.6;
  text-decoration: line-through;
}
.status-pending { border: 2px solid #3B82F6; }
.status-cancelled { 
  border: 2px solid #EF4444; 
  opacity: 0.5;
  text-decoration: line-through;
}
.status-completed { border: 2px solid #64748B; opacity: 0.7; }

/* Avisos/Reminders */
.reminder-high { 
  background-color: #DC2626;
  animation: pulse 2s infinite;
}
.reminder-medium { background-color: #F59E0B; }
.reminder-low { background-color: #3B82F6; }

/* Indicadores de Recorrência */
.recurring-badge {
  background-color: #8B5CF6;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
}
```

---

## 🔐 Regras de Validação

### Criação de Evento

1. **Campos Obrigatórios:**
   - title (mínimo 3 caracteres)
   - event_type ('admin', 'dojo', ou 'class')
   - category (categoria válida)
   - start_date (data válida)

2. **Eventos Admin:**
   - Apenas admin pode criar
   - dojo_id deve ser null

3. **Eventos Dojo:**
   - dojo_id obrigatório
   - Usuários só criam para seu dojo
   - Admin pode criar para qualquer dojo

4. **Eventos Recorrentes:**
   - recurrence_type obrigatório se is_recurring=true
   - recurrence_pattern deve ser JSON válido
   - recurrence_end_date obrigatório para séries
   - Validar padrão de recorrência (dias da semana, horários, etc.)

5. **Datas:**
   - end_date >= start_date
   - Eventos passados: apenas admin
   - recurrence_end_date > start_date

6. **Participantes:**
   - max_participants > 0 ou null

7. **Avisos:**
   - reminder_priority deve ser 'high', 'medium' ou 'low'
   - reminder_settings deve ser JSON válido

### Edição de Evento

1. **Permissões:**
   - Admin: edita qualquer evento
   - Dojo: edita apenas seus eventos

2. **Restrições:**
   - Não alterar event_type após criação
   - Não alterar dojo_id após criação
   - Não alterar parent_event_id (evento pai da série)

3. **Eventos Recorrentes:**
   - Edição individual: apenas o evento selecionado
   - Edição da série: todos os eventos futuros
   - Criar exceção: marcar como is_exception=true

### Suspensão de Evento

1. **Permissões:**
   - Admin: suspende qualquer evento
   - Dojo: suspende apenas seus eventos

2. **Validações:**
   - Evento deve estar com status 'active' ou 'pending'
   - suspension_reason obrigatório
   - Série: opção de suspender todos os eventos da série

3. **Efeitos:**
   - Status alterado para 'suspended'
   - Evento visível mas destacado como suspenso
   - Avisos automáticos sobre suspensão

### Deleção

1. **Permissões:**
   - Admin: deleta qualquer evento
   - Dojo: deleta apenas seus eventos

2. **Confirmação:**
   - Eventos com inscrições requerem confirmação dupla
   - Eventos recorrentes: opção de deletar série completa
   
3. **Avisos:**
   - Notificar usuários inscritos sobre cancelamento
   - Deletar avisos associados

---

## 📊 Dados de Demonstração

Script de seed incluirá:

**Eventos Admin:**
- Assembleia Geral (evento único)
- Seminário Nacional (com avisos de alta prioridade)
- Avisos importantes da federação
- Aniversário da Federação (evento anual recorrente)

**Eventos Recorrentes por Dojo:**
- Aulas regulares (terça, quinta e sábado)
- Treinos matinais (todas segundas)
- Aula infantil (quarta e sexta)

**Eventos Únicos por Dojo:**
- Exames de graduação (com avisos configurados)
- Aulas especiais/workshops
- Eventos sociais
- Férias/recessos (com suspensão)

**Eventos Suspensos:**
- Aula cancelada pontualmente
- Série de aulas suspensas por reforma
- Recesso de final de ano

---

## 🚀 Integração com Sistema Existente

### Com Dojos
- Eventos vinculados a dojos
- Filtros usam lista de dojos
- Controle de acesso por dojo_id

### Com Usuários
- Rastreamento de criador
- Permissões por role
- Auditoria

### Com Membros (Futuro)
- Inscrições em eventos
- Lista de participantes
- Histórico de eventos

### Com Graduações (Futuro)
- Vincular exames com graduações
- Criação automática após exame
- Relatórios

---

## 📱 Responsividade

**Desktop (>= 1024px)**
- Calendário mensal completo
- Sidebar de filtros fixo
- Modais centralizados

**Tablet (768px - 1023px)**
- Calendário mensal compacto
- Filtros em drawer
- Visualização ajustada

**Mobile (< 768px)**
- Lista como padrão
- Calendário simplificado
- Filtros em bottom sheet
- Navegação por gestures

---

## 🔄 Fluxos de Usuário

### 1. Visualizar Eventos
1. Acessa "Calendário"
2. Sistema carrega mês atual
3. Vê calendário com eventos
4. Clica em dia para detalhes

### 2. Criar Evento (Dojo)
1. Clica "Novo Evento"
2. Preenche formulário
3. Sistema valida
4. Salva evento
5. Atualiza calendário
6. (Opcional) Configura avisos

### 3. Criar Evento (Admin)
1. Clica "Novo Evento"
2. Seleciona tipo "Administrativo"
3. Preenche dados
4. Configura avisos (se necessário)
5. Define prioridade
6. Salva e notifica dojos

### 4. Criar Aulas Recorrentes
1. Clica "Nova Aula Regular"
2. Define título e descrição
3. Seleciona dias da semana (ex: Ter, Qui, Sáb)
4. Define horários para cada dia
5. Define data de término da série
6. Sistema gera preview das ocorrências
7. Confirma criação
8. Sistema cria todos os eventos da série

### 5. Suspender Evento
1. Seleciona evento no calendário
2. Clica "Suspender"
3. Informa motivo da suspensão
4. Escolhe: suspender apenas este ou toda a série
5. Confirma suspensão
6. Sistema altera status e notifica

### 6. Reativar Evento Suspenso
1. Filtra eventos suspensos
2. Seleciona evento
3. Clica "Reativar"
4. Confirma reativação
5. Sistema restaura status ativo

### 7. Configurar Avisos
1. Acessa evento
2. Clica "Configurar Avisos"
3. Define prioridade (alta/média/baixa)
4. Escolhe tipos de aviso (banner, popup, badge)
5. Define quantos dias antes avisar
6. Personaliza mensagem (opcional)
7. Salva configurações

### 8. Visualizar Avisos Ativos
1. Acessa sistema
2. Vê banner no topo (se houver avisos urgentes)
3. Vê badge no menu calendário (contador)
4. Pop-up ao fazer login (avisos importantes)
5. Pode marcar como lido ou acessar evento
### 9. Filtrar Eventos
1. Abre filtros
2. Seleciona critérios (tipo, dojo, status, recorrência)
3. Aplica filtros
4. Calendário atualiza
5. Badge mostra filtros ativos

### 10. Editar Evento
1. Clica em evento
2. Sistema verifica permissões
3. Mostra botão "Editar"
4. Escolhe: editar este evento ou toda série (se recorrente)
5. Abre modal preenchido
6. Modifica e salva

### 11. Editar Série de Eventos
1. Seleciona evento recorrente
2. Clica "Editar Série"
3. Escolhe opção:
   - Apenas este evento
   - Este e seguintes
   - Toda a série
4. Faz alterações
5. Sistema aplica mudanças conforme escolha

---

## 🧪 Casos de Teste

**Permissões Admin:**
- ✅ Criar eventos admin
- ✅ Criar eventos para qualquer dojo
- ✅ Criar eventos recorrentes
- ✅ Editar qualquer evento
- ✅ Suspender qualquer evento
- ✅ Deletar qualquer evento
- ✅ Configurar avisos

**Permissões Dojo:**
- ✅ Criar eventos para seu dojo
- ✅ Criar aulas recorrentes para seu dojo
- ❌ Criar eventos admin
- ❌ Criar para outro dojo
- ✅ Editar seus eventos
- ✅ Suspender seus eventos
- ❌ Editar eventos de outro dojo
- ✅ Ver eventos de todos
- ✅ Configurar avisos para seus eventos

**Eventos Recorrentes:**
- ✅ Criar série semanal
- ✅ Criar série mensal
- ✅ Criar série anual
- ✅ Editar ocorrência individual
- ✅ Editar série completa
- ✅ Deletar ocorrência individual
- ✅ Deletar série completa
- ✅ Criar exceção na série
- ✅ Suspender série completa

**Sistema de Suspensão:**
- ✅ Suspender evento único
- ✅ Suspender evento recorrente (individual)
- ✅ Suspender série completa
- ✅ Registrar motivo de suspensão
- ✅ Reativar evento suspenso
- ✅ Visualizar histórico de suspensões
- ✅ Eventos suspensos com estilo diferenciado

**Sistema de Avisos:**
- ✅ Configurar avisos por evento
- ✅ Definir prioridade (alta/média/baixa)
- ✅ Escolher tipos (banner/popup/badge/notificação)
- ✅ Avisos automáticos (7, 3, 1 dias antes)
- ✅ Banner exibido no topo do site
- ✅ Badge com contador no menu
- ✅ Pop-up ao fazer login
- ✅ Marcar avisos como lidos
- ✅ Filtrar eventos com avisos ativos

**Filtros:**
- ✅ Por tipo (admin/dojo/class)
- ✅ Por múltiplos dojos
- ✅ Por categoria
- ✅ Por status (ativo/suspenso/cancelado/completo)
- ✅ Por recorrência (único/recorrente)
- ✅ Por período
- ✅ Por avisos ativos
- ✅ Busca por texto
- ✅ Combinação múltipla

**Validações:**
- ✅ Campos obrigatórios
- ✅ Datas válidas
- ✅ Categoria válida
- ✅ Tipo válido
- ✅ Dojo em eventos dojo
- ✅ Sem dojo em eventos admin
- ✅ Padrão de recorrência válido
- ✅ Data fim > data início (para séries)
- ✅ Prioridade de aviso válida

---

## 📈 Métricas de Sucesso

**Performance:**
- Carregamento < 1s
- Filtros < 500ms
- Criação < 2s

**Usabilidade:**
- 90% criam evento sem ajuda
- 95% conseguem filtrar
- Zero cliques para ver mês atual

**Adoção:**
- 80% dojos criam 1+ evento no 1º mês
- 100% admins usam para avisos
- Média 5+ eventos/dojo/mês
- 70% dojos usam eventos recorrentes para aulas
- 90% eventos importantes com avisos configurados

---

## 🔮 Funcionalidades Futuras (v2.0+)

1. **Inscrições** ✨
   - Sistema de inscrição online
   - Lista de presença digital
   - Limite de vagas com lista de espera
   - Check-in por QR Code

2. **Notificações Avançadas** 📧
   - Email de lembrete automático
   - SMS para eventos urgentes
   - Push notifications (PWA)
   - Integração com WhatsApp
   - Avisos de novos eventos por categoria

3. **Recorrência Avançada** ✅ (já implementado na v1.0)
   - Eventos recorrentes ✅
   - Edição em lote ✅
   - Exceções em séries ✅

4. **Exportação** 📤
   - Exportar para .ics (iCalendar)
   - Sincronização com Google Calendar
   - PDF mensal do calendário
   - Exportar lista de eventos (Excel/CSV)

5. **Estatísticas** 📊
   - Dashboard de eventos
   - Eventos mais populares
   - Taxa de comparecimento
   - Relatórios por dojo
   - Heatmap de atividades

6. **Integração Membros** 👥
   - Histórico de eventos do membro
   - Presença automática em exames
   - Certificados automáticos
   - Pré-requisitos para eventos

7. **Sistema de Avisos Avançado** 🔔 (parcialmente implementado na v1.0)
   - Avisos web ✅
   - Email automático
   - SMS para eventos críticos
   - Notificações personalizadas por usuário

---

## 📝 Checklist de Implementação

### Backend - Modelos ✅ **CONCLUÍDO**
- [x] Criar modelo Event
- [x] Criar modelo EventReminder
- [x] Adicionar campos de recorrência
- [x] Adicionar campos de suspensão
- [x] Adicionar campos de avisos
- [x] Atualizar __init__.py
- [x] Criar modelo EventOccurrence (para cache)
- [ ] Criar métodos para gerenciar séries (futuro)
- [ ] Criar métodos para calcular ocorrências (futuro)

### Backend - Rotas ✅ **CONCLUÍDO**
- [x] Criar routes/events.py
- [x] Implementar GET /api/events
- [x] Implementar GET /api/events/<id>
- [x] Implementar POST /api/events
- [x] Implementar POST /api/events/recurring (implementado via POST /api/events com is_recurring=true)
- [x] Implementar PUT /api/events/<id>
- [ ] Implementar PUT /api/events/<id>/series (futuro - edição em lote)
- [x] Implementar DELETE /api/events/<id>
- [x] Implementar POST /api/events/<id>/suspend
- [x] Implementar POST /api/events/<id>/reactivate
- [x] Implementar POST /api/events/<id>/reminders
- [x] Implementar GET /api/events/reminders/active
- [x] Implementar GET /api/events/statistics
- [x] Controle de permissões
- [x] Validações de recorrência
- [x] Lógica de suspensão
- [x] Registrar blueprint
- [x] Seed de eventos demo
- [x] Atualizar init_database()
- [x] Testar endpoints

### Frontend - Estrutura
- [ ] Botão no menu com badge de avisos
- [ ] Section #calendarScreen
- [ ] HTML calendário
- [ ] Painel de filtros (com filtros de status e recorrência)
- [ ] Modal de evento
- [ ] Modal de evento recorrente
- [ ] Modal de suspensão
- [ ] Modal de configuração de avisos
- [ ] Banner de avisos no topo
- [ ] Pop-up de avisos ao login

### Frontend - Lógica
- [ ] loadEvents()
- [ ] renderCalendarMonth()
- [ ] renderCalendarWeek()
- [ ] renderEventsList()
- [ ] applyEventFilters()
- [ ] createEvent()
- [ ] createRecurringEvent()
- [ ] editEvent()
- [ ] editEventSeries()
- [ ] deleteEvent()
- [ ] suspendEvent()
- [ ] reactivateEvent()
- [ ] configureReminders()
- [ ] loadActiveReminders()
- [ ] showReminderBanner()
- [ ] showReminderPopup()
- [ ] updateReminderBadge()
- [ ] showEventDetails()
- [ ] previewRecurrenceOccurrences()

### Frontend - Estilos
- [ ] CSS calendário mensal
- [ ] CSS calendário semanal
- [ ] CSS lista eventos
- [ ] CSS filtros
- [ ] CSS modal evento
- [ ] CSS modal recorrência
- [ ] CSS modal suspensão
- [ ] CSS modal avisos
- [ ] CSS responsivo
- [ ] Cores por categoria
- [ ] Indicadores status (ativo, suspenso, cancelado)
- [ ] Badges de recorrência
- [ ] Banner de avisos
- [ ] Pop-up de avisos
- [ ] Badge contador no menu
- [ ] Animações (pulse para alta prioridade)

### Testes
- [ ] Permissões admin
- [ ] Permissões dojo
- [ ] Filtros básicos
- [ ] Filtros avançados (status, recorrência, avisos)
- [ ] Validações
- [ ] Criar evento recorrente
- [ ] Editar evento individual
- [ ] Editar série de eventos
- [ ] Suspender evento
- [ ] Suspender série
- [ ] Reativar evento
- [ ] Configurar avisos
- [ ] Exibir avisos (banner, popup, badge)
- [ ] Deletar evento/série
- [ ] Visualizações
- [ ] Responsivo
- [ ] Integração completa

### Documentação
- [ ] Atualizar API.md (novos endpoints)
- [ ] Atualizar README (novos recursos)
- [ ] Documentar padrões de recorrência
- [ ] Documentar sistema de avisos
- [ ] Documentar sistema de suspensão
- [ ] Screenshots
- [ ] Exemplos de uso
- [ ] Demo (opcional)

---

## 🎓 Conclusão

O Sistema de Calendário de Eventos proporcionará:

- **Visibilidade**: Todos veem eventos da federação e recebem avisos importantes
- **Organização**: Agenda centralizada com eventos únicos e recorrentes
- **Controle**: Permissões granulares e gestão de status
- **Flexibilidade**: Múltiplas visualizações, filtros avançados e suspensão temporária
- **Integração**: Conexão com sistema existente e avisos em tempo real
- **Automação**: Aulas regulares automáticas e avisos programados
- **Gestão Inteligente**: Suspensão sem perda de dados e fácil reativação

**Principais Recursos:**

✅ **Eventos Recorrentes**: Perfeito para aulas regulares (terça, quinta, sábado)  
✅ **Sistema de Avisos**: Notificações automáticas com banner, popup e badges  
✅ **Suspensão Temporária**: Cancelar aulas sem deletar, mantendo histórico  
✅ **Gestão de Séries**: Editar individual ou em lote eventos recorrentes  
✅ **Prioridades**: Avisos de alta, média e baixa prioridade  
✅ **Flexibilidade Total**: Exceções em séries, múltiplos horários por semana

**Casos de Uso Escolares:**

- Aulas regulares (terça 19h, quinta 19h, sábado 10h) → Evento recorrente semanal
- Feriado municipal → Suspender aula pontual com motivo
- Férias de verão → Suspender série completa por período
- Exame importante → Aviso de alta prioridade com banner 7 dias antes
- Evento anual (aniversário do dojo) → Recorrência anual
- Aula cancelada por reforma → Suspensão temporária com possibilidade de reativar

**Tempo estimado**: 14-16 dias úteis  
**Prioridade**: Alta  
**Complexidade**: Média-Alta

---

**Documento criado**: 16 de Outubro de 2025  
**Versão**: 2.0 (Atualizado com Avisos, Recorrência e Suspensão)  
**Autor**: Sistema Ki Aikido Development Team
