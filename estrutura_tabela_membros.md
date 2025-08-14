# Estrutura da Nova Tabela: Member Status/Graduação

## Visão Geral

A nova tabela `member_status` será responsável por armazenar informações de status organizacional, graduações e qualificações dos membros, complementando a tabela de cadastro básico existente.

## Estrutura da Tabela Principal: `member_status`

```sql
CREATE TABLE member_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,  -- FK para tabela students existente
    registered_number VARCHAR(50), -- Número de registro oficial (ex: KIA-XXX-XXXX)
    membership_date DATE,          -- Data de filiação/ingresso
    member_type VARCHAR(50),       -- Tipo: student, instructor, assistant, chief_instructor
    current_status VARCHAR(50),    -- Status: active, inactive, pending
    last_activity_year INTEGER,   -- Último ano de atividade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

## Tabela de Graduações: `member_graduations`

```sql
CREATE TABLE member_graduations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_status_id INTEGER NOT NULL,
    discipline VARCHAR(100) NOT NULL,  -- 'Shinshin Toitsudo' ou 'Shinshin Toitsu Aikido'
    rank_name VARCHAR(100) NOT NULL,   -- Nome da graduação (Shokyu, 1st Kyu, Shodan, etc.)
    rank_level INTEGER,               -- Nível numérico para ordenação
    examination_date DATE,            -- Data do exame
    certificate_number VARCHAR(100), -- Número do certificado
    certificate_status VARCHAR(50),  -- Status: issued, pending, to-be-filed
    is_current BOOLEAN DEFAULT FALSE, -- Indica se é a graduação atual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_status_id) REFERENCES member_status(id)
);
```

## Tabela de Qualificações: `member_qualifications`

```sql
CREATE TABLE member_qualifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_status_id INTEGER NOT NULL,
    qualification_type VARCHAR(100) NOT NULL, -- 'examiner', 'lecturer', 'assistant'
    qualification_level VARCHAR(100),         -- Nível da qualificação
    date_obtained DATE,                       -- Data de obtenção
    certificate_number VARCHAR(100),         -- Número do certificado
    is_active BOOLEAN DEFAULT TRUE,          -- Se a qualificação está ativa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_status_id) REFERENCES member_status(id)
);
```

## Campos Principais por Tabela

### member_status (Informações Gerais)
- **student_id**: Link para cadastro básico existente
- **registered_number**: Número oficial de registro
- **membership_date**: Data de ingresso na organização
- **member_type**: Tipo de membro (estudante, instrutor, etc.)
- **current_status**: Status atual (ativo, inativo, pendente)
- **last_activity_year**: Controle de atividade

### member_graduations (Histórico de Graduações)
- **discipline**: Shinshin Toitsudo ou Shinshin Toitsu Aikido
- **rank_name**: Nome da graduação
- **rank_level**: Nível numérico para ordenação
- **examination_date**: Data do exame
- **certificate_number**: Número do certificado
- **certificate_status**: Status do certificado
- **is_current**: Marca a graduação atual

### member_qualifications (Qualificações Especiais)
- **qualification_type**: Tipo (examinador, instrutor, assistente)
- **qualification_level**: Nível da qualificação
- **date_obtained**: Data de obtenção
- **is_active**: Se está ativa

## Relacionamentos

1. **member_status** ↔ **students** (1:1)
   - Um membro pode ter apenas um registro de status
   - Um estudante pode ter informações de membro

2. **member_status** ↔ **member_graduations** (1:N)
   - Um membro pode ter múltiplas graduações (histórico)
   - Cada graduação pertence a um membro

3. **member_status** ↔ **member_qualifications** (1:N)
   - Um membro pode ter múltiplas qualificações
   - Cada qualificação pertence a um membro

## Enums/Constantes Sugeridas

### Member Types:
- `student` - Estudante
- `assistant` - Assistente
- `instructor` - Instrutor
- `chief_instructor` - Instrutor Chefe

### Status:
- `active` - Ativo
- `inactive` - Inativo
- `pending` - Pendente

### Disciplines:
- `Shinshin Toitsudo`
- `Shinshin Toitsu Aikido`

### Shinshin Toitsudo Ranks:
- `Shokyu` (level: 1)
- `Chukyu` (level: 2)
- `Jokyu` (level: 3)
- `Okuden` (level: 4)

### Shinshin Toitsu Aikido Ranks:
- `5th Kyu` (level: 1)
- `4th Kyu` (level: 2)
- `3rd Kyu` (level: 3)
- `2nd Kyu` (level: 4)
- `1st Kyu` (level: 5)
- `Shodan` (level: 6)
- `Nidan` (level: 7)
- `Sandan` (level: 8)
- `Yondan` (level: 9)
- `Godan` (level: 10)
- `Rokudan` (level: 11)
- `Shichidan` (level: 12)
- `Hachidan` (level: 13)

### Qualification Types:
- `examiner` - Examinador
- `lecturer` - Instrutor/Palestrante
- `assistant` - Assistente

## Vantagens desta Estrutura

1. **Separação de Responsabilidades**: Dados pessoais separados de dados organizacionais
2. **Histórico Completo**: Mantém todo o histórico de graduações
3. **Flexibilidade**: Permite múltiplas disciplinas e qualificações
4. **Escalabilidade**: Fácil adição de novos tipos de graduação
5. **Integridade**: Relacionamentos bem definidos com a tabela existente
6. **Auditoria**: Timestamps para controle de alterações

