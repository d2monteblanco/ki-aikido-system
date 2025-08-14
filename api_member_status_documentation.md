# API de Status/Graduação dos Membros - Documentação

## Visão Geral

Esta documentação descreve as novas APIs para gerenciar informações de status organizacional, graduações e qualificações dos membros do sistema Ki Aikido.

## Estrutura de Dados

### MemberStatus (Status do Membro)
Informações organizacionais básicas do membro:
- `student_id`: ID do estudante (FK)
- `registered_number`: Número oficial de registro
- `membership_date`: Data de filiação
- `member_type`: Tipo de membro (student, instructor, assistant, chief_instructor)
- `current_status`: Status atual (active, inactive, pending)
- `last_activity_year`: Último ano de atividade

### MemberGraduation (Graduações)
Histórico de graduações do membro:
- `discipline`: Disciplina (Shinshin Toitsudo, Shinshin Toitsu Aikido)
- `rank_name`: Nome da graduação
- `rank_level`: Nível numérico para ordenação
- `examination_date`: Data do exame
- `certificate_number`: Número do certificado
- `certificate_status`: Status do certificado
- `is_current`: Se é a graduação atual

### MemberQualification (Qualificações)
Qualificações especiais do membro:
- `qualification_type`: Tipo (examiner, lecturer, assistant)
- `qualification_level`: Nível da qualificação
- `date_obtained`: Data de obtenção
- `certificate_number`: Número do certificado
- `is_active`: Se está ativa

## Endpoints da API

### Status dos Membros

#### GET /api/member-status
Lista todos os status de membros com paginação e filtros.

**Parâmetros de Query:**
- `page`: Página (padrão: 1)
- `per_page`: Itens por página (padrão: 20, máx: 100)
- `search`: Busca por nome ou número de registro
- `member_type`: Filtro por tipo de membro
- `current_status`: Filtro por status atual
- `dojo_id`: Filtro por dojo

**Resposta:**
```json
{
  "member_status": [
    {
      "id": 1,
      "student_id": 1,
      "student_name": "João Silva",
      "registered_number": "KIA-001-0001",
      "member_type": "student",
      "member_type_display": "Estudante",
      "current_status": "active",
      "current_graduations": {
        "Shinshin Toitsu Aikido": {
          "rank_name": "1st Kyu",
          "rank_level": 5
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

#### GET /api/member-status/{id}
Retorna detalhes completos de um status de membro.

**Resposta:**
```json
{
  "id": 1,
  "student_id": 1,
  "student_name": "João Silva",
  "registered_number": "KIA-001-0001",
  "membership_date": "2020-01-15",
  "member_type": "student",
  "member_type_display": "Estudante",
  "current_status": "active",
  "current_status_display": "Ativo",
  "last_activity_year": 2024,
  "current_graduations": {
    "Shinshin Toitsu Aikido": {
      "id": 5,
      "rank_name": "1st Kyu",
      "rank_display": "1º Kyu",
      "rank_level": 5,
      "examination_date": "2023-08-25",
      "certificate_number": "CERT-2023-001",
      "certificate_status": "issued",
      "is_current": true
    }
  },
  "total_graduations": 5,
  "total_qualifications": 0,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

#### POST /api/member-status
Cria um novo status de membro.

**Body:**
```json
{
  "student_id": 1,
  "registered_number": "KIA-001-0001",
  "membership_date": "2020-01-15",
  "member_type": "student",
  "current_status": "active",
  "last_activity_year": 2024
}
```

#### PUT /api/member-status/{id}
Atualiza um status de membro.

#### DELETE /api/member-status/{id}
Remove um status de membro.

### Graduações

#### GET /api/member-status/{member_status_id}/graduations
Lista graduações de um membro.

**Parâmetros de Query:**
- `discipline`: Filtro por disciplina
- `is_current`: Filtro por graduações atuais

**Resposta:**
```json
[
  {
    "id": 1,
    "member_status_id": 1,
    "discipline": "Shinshin Toitsu Aikido",
    "rank_name": "1st Kyu",
    "rank_display": "1º Kyu",
    "rank_level": 5,
    "examination_date": "2023-08-25",
    "certificate_number": "CERT-2023-001",
    "certificate_status": "issued",
    "certificate_status_display": "Emitido",
    "is_current": true,
    "created_at": "2023-08-25T10:00:00"
  }
]
```

#### POST /api/member-status/{member_status_id}/graduations
Cria uma nova graduação.

**Body:**
```json
{
  "discipline": "Shinshin Toitsu Aikido",
  "rank_name": "1st Kyu",
  "examination_date": "2023-08-25",
  "certificate_number": "CERT-2023-001",
  "certificate_status": "issued",
  "is_current": true
}
```

#### GET /api/graduations/{id}
Retorna detalhes de uma graduação.

#### PUT /api/graduations/{id}
Atualiza uma graduação.

#### DELETE /api/graduations/{id}
Remove uma graduação.

#### POST /api/graduations/{id}/set-current
Define uma graduação como atual.

### Constantes

#### GET /api/member-status/constants
Retorna todas as constantes para formulários.

**Resposta:**
```json
{
  "member_types": {
    "student": "Estudante",
    "assistant": "Assistente",
    "instructor": "Instrutor",
    "chief_instructor": "Instrutor Chefe"
  },
  "status_types": {
    "active": "Ativo",
    "inactive": "Inativo",
    "pending": "Pendente"
  },
  "disciplines": {
    "Shinshin Toitsudo": "Shinshin Toitsudo",
    "Shinshin Toitsu Aikido": "Shinshin Toitsu Aikido"
  },
  "toitsudo_ranks": {
    "Shokyu": {"level": 1, "display": "Shokyu (Básico)"},
    "Chukyu": {"level": 2, "display": "Chukyu (Intermediário)"},
    "Jokyu": {"level": 3, "display": "Jokyu (Avançado)"},
    "Okuden": {"level": 4, "display": "Okuden (Mestre)"}
  },
  "aikido_ranks": {
    "5th Kyu": {"level": 1, "display": "5º Kyu"},
    "4th Kyu": {"level": 2, "display": "4º Kyu"},
    "3rd Kyu": {"level": 3, "display": "3º Kyu"},
    "2nd Kyu": {"level": 4, "display": "2º Kyu"},
    "1st Kyu": {"level": 5, "display": "1º Kyu"},
    "Shodan": {"level": 6, "display": "Shodan (1º Dan)"},
    "Nidan": {"level": 7, "display": "Nidan (2º Dan)"},
    "Sandan": {"level": 8, "display": "Sandan (3º Dan)"},
    "Yondan": {"level": 9, "display": "Yondan (4º Dan)"},
    "Godan": {"level": 10, "display": "Godan (5º Dan)"},
    "Rokudan": {"level": 11, "display": "Rokudan (6º Dan)"},
    "Shichidan": {"level": 12, "display": "Shichidan (7º Dan)"},
    "Hachidan": {"level": 13, "display": "Hachidan (8º Dan)"}
  },
  "qualification_types": {
    "examiner": "Examinador",
    "lecturer": "Instrutor/Palestrante",
    "assistant": "Assistente",
    "special_examiner": "Examinador Especial"
  },
  "certificate_status": {
    "issued": "Emitido",
    "pending": "Pendente",
    "to-be-filed": "A ser arquivado"
  }
}
```

## Autenticação e Autorização

- Todas as rotas requerem autenticação via sessão
- Usuários de dojo só podem acessar membros do seu dojo
- Administradores têm acesso a todos os dojos

## Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Não encontrado
- `500`: Erro interno do servidor

## Exemplos de Uso

### Criar Status de Membro
```bash
curl -X POST http://localhost:5000/api/member-status \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "student_id": 1,
    "registered_number": "KIA-001-0001",
    "membership_date": "2020-01-15",
    "member_type": "student",
    "current_status": "active"
  }'
```

### Adicionar Graduação
```bash
curl -X POST http://localhost:5000/api/member-status/1/graduations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "discipline": "Shinshin Toitsu Aikido",
    "rank_name": "1st Kyu",
    "examination_date": "2023-08-25",
    "certificate_number": "CERT-2023-001",
    "certificate_status": "issued",
    "is_current": true
  }'
```

### Listar Membros com Filtros
```bash
curl -X GET "http://localhost:5000/api/member-status?member_type=instructor&current_status=active&page=1&per_page=10" \
  -b cookies.txt
```

