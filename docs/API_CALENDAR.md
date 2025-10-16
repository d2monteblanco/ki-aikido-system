# 📅 Sistema de Calendário de Eventos - Documentação API

## Visão Geral

O Sistema de Calendário de Eventos permite gerenciar eventos administrativos e de dojos com suporte a recorrência, suspensão temporária e sistema de avisos.

**Versão da API**: 1.0  
**Base URL**: `http://localhost:5000/api`  
**Autenticação**: JWT Bearer Token

---

## Autenticação

Todos os endpoints de eventos requerem autenticação via JWT token no header:

```
Authorization: Bearer <seu_token_jwt>
```

### Obter Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@kiaikido.com",
  "password": "senha"
}
```

**Resposta**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "email": "admin@kiaikido.com",
    "name": "Administrador Geral",
    "role": "admin",
    "dojo_id": null
  }
}
```

---

## Endpoints de Eventos

### 1. Listar Eventos

```http
GET /api/events
```

**Parâmetros de Query** (todos opcionais):

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `event_type` | string | Tipo: `admin` ou `dojo` | `?event_type=admin` |
| `dojo_id` | integer | ID do dojo | `?dojo_id=1` |
| `category` | string | Categoria do evento | `?category=exame` |
| `status` | string | Status: `active`, `suspended`, `cancelled`, `completed` | `?status=active` |
| `start_date` | string | Data início (ISO 8601) | `?start_date=2025-11-01T00:00:00` |
| `end_date` | string | Data fim (ISO 8601) | `?end_date=2025-12-31T23:59:59` |
| `is_recurring` | boolean | Filtrar recorrentes | `?is_recurring=true` |
| `search` | string | Busca em título/descrição | `?search=Seminário` |
| `sort_by` | string | Ordenar por: `start_datetime`, `title`, `event_type` | `?sort_by=start_datetime` |
| `sort_order` | string | Ordem: `asc` ou `desc` | `?sort_order=desc` |
| `page` | integer | Página (padrão: 1) | `?page=2` |
| `per_page` | integer | Itens por página (padrão: 50, max: 500) | `?per_page=100` |

**Categorias Disponíveis**:
- `exame` - Exames de graduação
- `seminario` - Seminários e workshops
- `aula_especial` - Aulas especiais
- `aula_regular` - Aulas regulares
- `evento_social` - Eventos sociais
- `aviso` - Avisos gerais
- `outro` - Outros eventos

**Resposta**:
```json
{
  "events": [
    {
      "id": 1,
      "title": "Seminário Nacional Ki Aikido 2025",
      "description": "Seminário nacional com mestres convidados do Japão",
      "category": "seminario",
      "event_type": "admin",
      "dojo_id": null,
      "dojo_name": null,
      "start_datetime": "2025-11-15T09:00:00",
      "end_datetime": "2025-11-15T18:00:00",
      "all_day": false,
      "status": "active",
      "suspension_reason": null,
      "is_recurring": false,
      "recurrence_pattern": null,
      "recurrence_interval": 1,
      "recurrence_days": null,
      "recurrence_end_date": null,
      "recurrence_count": null,
      "series_id": null,
      "parent_event_id": null,
      "is_exception": false,
      "location": "São Paulo, SP",
      "reminder_priority": "high",
      "created_by": 1,
      "created_at": "2025-10-16T12:47:42.167700",
      "updated_at": "2025-10-16T12:47:42.167700"
    }
  ],
  "total": 7,
  "pages": 1,
  "current_page": 1,
  "per_page": 50
}
```

**Permissões**:
- Admin: pode ver todos os eventos
- Dojo: pode ver todos os eventos (mas só pode editar os próprios)

---

### 2. Obter Detalhes de Evento

```http
GET /api/events/{id}
```

**Resposta**:
```json
{
  "id": 1,
  "title": "Seminário Nacional Ki Aikido 2025",
  "description": "Seminário nacional com mestres convidados do Japão",
  "category": "seminario",
  "event_type": "admin",
  "dojo_id": null,
  "dojo_name": null,
  "start_datetime": "2025-11-15T09:00:00",
  "end_datetime": "2025-11-15T18:00:00",
  "all_day": false,
  "status": "active",
  "suspension_reason": null,
  "is_recurring": false,
  "recurrence_pattern": null,
  "recurrence_interval": 1,
  "recurrence_days": null,
  "recurrence_end_date": null,
  "recurrence_count": null,
  "series_id": null,
  "parent_event_id": null,
  "is_exception": false,
  "location": "São Paulo, SP",
  "reminder_priority": "high",
  "created_by": 1,
  "created_at": "2025-10-16T12:47:42.167700",
  "updated_at": "2025-10-16T12:47:42.167700",
  "reminders": [
    {
      "id": 1,
      "event_id": 1,
      "days_before": 7,
      "reminder_type": "banner",
      "message": "Lembrete: Seminário Nacional Ki Aikido 2025 em 7 dia(s)",
      "is_active": true,
      "triggered_at": null,
      "created_at": "2025-10-16T12:47:42.181093"
    }
  ]
}
```

---

### 3. Criar Evento

```http
POST /api/events
Content-Type: application/json
```

**Body (Evento Simples)**:
```json
{
  "title": "Aula Especial de Taigi",
  "description": "Prática focada em Taigi",
  "category": "aula_especial",
  "event_type": "dojo",
  "dojo_id": 1,
  "start_datetime": "2025-11-01T10:00:00",
  "end_datetime": "2025-11-01T12:00:00",
  "location": "Dojo Florianópolis",
  "all_day": false,
  "reminder_priority": "medium",
  "create_default_reminders": true
}
```

**Body (Evento Recorrente)**:
```json
{
  "title": "Aula Regular - Adultos",
  "description": "Treino regular de Ki Aikido para adultos",
  "category": "aula_regular",
  "event_type": "dojo",
  "dojo_id": 1,
  "start_datetime": "2025-11-01T19:00:00",
  "end_datetime": "2025-11-01T20:30:00",
  "location": "Dojo Florianópolis",
  "reminder_priority": "low",
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days": "2,4",
  "recurrence_end_date": "2026-12-31T23:59:59",
  "create_default_reminders": false
}
```

**Campos Obrigatórios**:
- `title` (string): Título do evento
- `category` (string): Categoria (ver lista acima)
- `event_type` (string): `admin` ou `dojo`
- `start_datetime` (string): Data/hora início (ISO 8601)
- `end_datetime` (string): Data/hora fim (ISO 8601)
- `dojo_id` (integer): Obrigatório se `event_type` = `dojo`

**Campos Opcionais**:
- `description` (string): Descrição do evento
- `location` (string): Local do evento
- `all_day` (boolean): Evento de dia inteiro (padrão: false)
- `reminder_priority` (string): `high`, `medium`, `low` (padrão: `medium`)
- `create_default_reminders` (boolean): Criar avisos padrão (7, 3, 1, 0 dias antes)

**Campos de Recorrência** (se `is_recurring` = true):
- `recurrence_pattern` (string): `daily`, `weekly`, `monthly`, `yearly`
- `recurrence_interval` (integer): Intervalo (ex: 2 = a cada 2 semanas)
- `recurrence_days` (string): Dias da semana separados por vírgula (0=Dom, 1=Seg, ..., 6=Sáb). Ex: `"2,4"` para terça e quinta
- `recurrence_end_date` (string): Data fim da recorrência (ISO 8601)
- `recurrence_count` (integer): Número de ocorrências (alternativa ao end_date)

**Resposta**:
```json
{
  "message": "Evento criado com sucesso",
  "event": {
    "id": 8,
    "title": "Aula Especial de Taigi",
    ...
  }
}
```

**Permissões**:
- Admin: pode criar eventos `admin` e `dojo` (de qualquer dojo)
- Dojo: pode criar apenas eventos `dojo` do próprio dojo

---

### 4. Atualizar Evento

```http
PUT /api/events/{id}
Content-Type: application/json
```

**Body** (campos a atualizar):
```json
{
  "title": "Aula Especial de Taigi - ATUALIZADO",
  "description": "Nova descrição",
  "start_datetime": "2025-11-01T14:00:00",
  "end_datetime": "2025-11-01T16:00:00",
  "location": "Novo local",
  "reminder_priority": "high",
  "status": "active"
}
```

**Resposta**:
```json
{
  "message": "Evento atualizado com sucesso",
  "event": {
    "id": 8,
    ...
  }
}
```

**Permissões**:
- Admin: pode editar qualquer evento
- Dojo: pode editar apenas eventos `dojo` do próprio dojo

---

### 5. Deletar Evento

```http
DELETE /api/events/{id}
```

**Resposta**:
```json
{
  "message": "Evento deletado com sucesso"
}
```

**Permissões**:
- Admin: pode deletar qualquer evento
- Dojo: pode deletar apenas eventos `dojo` do próprio dojo

---

### 6. Suspender Evento

```http
POST /api/events/{id}/suspend
Content-Type: application/json
```

**Body**:
```json
{
  "reason": "Instrutor em viagem"
}
```

**Resposta**:
```json
{
  "message": "Evento suspenso com sucesso",
  "event": {
    "id": 8,
    "status": "suspended",
    "suspension_reason": "Instrutor em viagem",
    ...
  }
}
```

**Uso**: Suspender temporariamente um evento sem deletá-lo. Útil para férias, feriados, etc.

---

### 7. Reativar Evento

```http
POST /api/events/{id}/reactivate
```

**Resposta**:
```json
{
  "message": "Evento reativado com sucesso",
  "event": {
    "id": 8,
    "status": "active",
    "suspension_reason": null,
    ...
  }
}
```

---

### 8. Criar Aviso para Evento

```http
POST /api/events/{id}/reminders
Content-Type: application/json
```

**Body**:
```json
{
  "days_before": 7,
  "reminder_type": "banner",
  "message": "Lembrete: Não esqueça do exame!",
  "is_active": true
}
```

**Campos**:
- `days_before` (integer): Quantos dias antes disparar (0 = no dia do evento)
- `reminder_type` (string): `banner`, `badge`, `popup`
- `message` (string, opcional): Mensagem personalizada
- `is_active` (boolean, opcional): Ativar imediatamente (padrão: true)

**Resposta**:
```json
{
  "message": "Aviso criado com sucesso",
  "reminder": {
    "id": 5,
    "event_id": 8,
    "days_before": 7,
    "reminder_type": "banner",
    "message": "Lembrete: Não esqueça do exame!",
    "is_active": true,
    "triggered_at": null,
    "created_at": "2025-10-16T13:00:00"
  }
}
```

---

### 9. Listar Avisos Ativos

```http
GET /api/events/reminders/active
```

**Resposta**:
```json
{
  "reminders": [
    {
      "id": 1,
      "event_id": 1,
      "days_before": 7,
      "reminder_type": "banner",
      "message": "Lembrete: Seminário Nacional Ki Aikido 2025 em 7 dia(s)",
      "is_active": true,
      "triggered_at": null,
      "created_at": "2025-10-16T12:47:42.181093",
      "event": {
        "id": 1,
        "title": "Seminário Nacional Ki Aikido 2025",
        "start_datetime": "2025-11-15T09:00:00",
        ...
      }
    }
  ],
  "count": 1
}
```

**Uso**: Obter avisos que devem ser exibidos nos próximos 7 dias.

---

### 10. Estatísticas de Eventos

```http
GET /api/events/statistics
```

**Resposta**:
```json
{
  "total_events": 8,
  "by_status": {
    "active": 7,
    "suspended": 1,
    "cancelled": 0
  },
  "by_type": {
    "admin": 3,
    "dojo": 5
  },
  "recurring_events": 1,
  "by_category": {
    "exame": 2,
    "seminario": 1,
    "aula_regular": 1,
    "aula_especial": 1,
    "evento_social": 1,
    "aviso": 2
  }
}
```

---

## Códigos de Resposta HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Sucesso (GET, PUT, DELETE) |
| 201 | Created | Recurso criado com sucesso (POST) |
| 400 | Bad Request | Dados inválidos ou faltando campos obrigatórios |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Sem permissão para esta ação |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## Padrões de Recorrência

### Recorrência Semanal

Evento que se repete em dias específicos da semana:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days": "2,4",
  "recurrence_end_date": "2026-12-31T23:59:59"
}
```

**Exemplo**: Aulas às terças (2) e quintas (4), todas as semanas, até 31/12/2026.

### Recorrência Mensal

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 1,
  "recurrence_end_date": "2026-12-31T23:59:59"
}
```

**Exemplo**: Todo dia 15 de cada mês.

### Recorrência Anual

```json
{
  "is_recurring": true,
  "recurrence_pattern": "yearly",
  "recurrence_interval": 1
}
```

**Exemplo**: Aniversário do dojo, todo ano na mesma data.

### Dias da Semana

- `0` = Domingo
- `1` = Segunda-feira
- `2` = Terça-feira
- `3` = Quarta-feira
- `4` = Quinta-feira
- `5` = Sexta-feira
- `6` = Sábado

---

## Exemplos de Uso

### Criar Aulas Regulares (Terça e Quinta 19h)

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aula Regular - Adultos",
    "description": "Treino regular de Ki Aikido",
    "category": "aula_regular",
    "event_type": "dojo",
    "dojo_id": 1,
    "start_datetime": "2025-11-05T19:00:00",
    "end_datetime": "2025-11-05T20:30:00",
    "location": "Dojo Florianópolis",
    "is_recurring": true,
    "recurrence_pattern": "weekly",
    "recurrence_interval": 1,
    "recurrence_days": "2,4",
    "recurrence_end_date": "2026-12-31T23:59:59"
  }'
```

### Suspender Aula por Férias

```bash
curl -X POST http://localhost:5000/api/events/4/suspend \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Recesso de fim de ano"
  }'
```

### Buscar Eventos de Exame em Novembro

```bash
curl "http://localhost:5000/api/events?category=exame&start_date=2025-11-01T00:00:00&end_date=2025-11-30T23:59:59" \
  -H "Authorization: Bearer $TOKEN"
```

### Criar Seminário com Avisos Automáticos

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Seminário Especial",
    "description": "Seminário com instrutor convidado",
    "category": "seminario",
    "event_type": "admin",
    "start_datetime": "2025-12-15T09:00:00",
    "end_datetime": "2025-12-15T18:00:00",
    "location": "São Paulo, SP",
    "reminder_priority": "high",
    "create_default_reminders": true
  }'
```

---

## Notas Importantes

1. **Datas**: Sempre use formato ISO 8601 (`YYYY-MM-DDTHH:MM:SS`)
2. **Fuso Horário**: Todas as datas são armazenadas em UTC
3. **Permissões**: Usuários do tipo `dojo_user` só podem criar/editar eventos do próprio dojo
4. **Eventos Recorrentes**: A `series_id` é gerada automaticamente para agrupar ocorrências
5. **Avisos**: Avisos são verificados automaticamente pelo sistema
6. **Status**: Use `suspended` para pausas temporárias e `cancelled` para cancelamentos permanentes

---

**Última atualização**: 16 de Outubro de 2025  
**Versão do documento**: 1.0
