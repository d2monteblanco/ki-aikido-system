# 🔌 Documentação da API - Sistema Ki Aikido

Esta documentação descreve todos os endpoints da API REST do Sistema Ki Aikido.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Endpoints](#-endpoints)
- [Modelos de Dados](#-modelos-de-dados)
- [Códigos de Status](#-códigos-de-status)
- [Exemplos de Uso](#-exemplos-de-uso)

## 🌐 Visão Geral

### URL Base
```
http://localhost:5000/api
```

### Formato de Dados
- **Request**: JSON
- **Response**: JSON
- **Encoding**: UTF-8

### Headers Obrigatórios
```http
Content-Type: application/json
```

### Autenticação
A API usa autenticação baseada em sessões. Após o login, um cookie de sessão é definido automaticamente.

## 🔐 Autenticação

### Login
Autentica um usuário e inicia uma sessão.

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@kiaikido.com",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Administrador Geral",
    "email": "admin@kiaikido.com",
    "role": "admin",
    "dojo_id": null,
    "dojo_name": null,
    "is_active": true,
    "created_at": "2025-08-11T12:41:49.101659"
  }
}
```

### Logout
Encerra a sessão do usuário.

```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### Usuário Atual
Retorna informações do usuário logado.

```http
GET /api/auth/me
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Administrador Geral",
    "email": "admin@kiaikido.com",
    "role": "admin",
    "dojo_id": null,
    "dojo_name": null,
    "is_active": true
  }
}
```

## 👥 Gestão de Alunos

### Listar Alunos
Lista alunos com paginação e filtros. Usuários de dojo veem apenas seus alunos.

```http
GET /api/students
```

**Query Parameters:**
- `page` (int): Página (padrão: 1)
- `per_page` (int): Itens por página (padrão: 20, máx: 100)
- `search` (string): Busca por nome, email ou registro
- `dojo_id` (int): Filtrar por dojo
- `status` (string): Filtrar por status (active, pending, inactive)

**Response (200):**
```json
{
  "students": [
    {
      "id": 1,
      "registration_number": "KIA-001-0001",
      "name": "João Silva",
      "email": "joao@teste.com",
      "birth_date": "1990-05-15",
      "address": "Rua das Flores, 123, Florianópolis, SC",
      "dojo_id": 1,
      "dojo_name": "Florianópolis Ki-Aikido Dojo",
      "registration_date": "2025-08-11T12:51:45.961632",
      "started_practicing_year": null,
      "status": "active",
      "notes": null,
      "created_at": "2025-08-11T12:51:45.963032",
      "updated_at": "2025-08-11T12:51:45.963034"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 1,
    "per_page": 20,
    "total": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### Criar Aluno
Cria um novo aluno. O número de registro é gerado automaticamente.

```http
POST /api/students
```

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "birth_date": "1985-03-20",
  "address": "Av. Principal, 456, São Paulo, SP",
  "dojo_id": 1,
  "started_practicing_year": 2023,
  "status": "active",
  "notes": "Observações sobre a aluna"
}
```

**Response (201):**
```json
{
  "message": "Student created successfully",
  "student": {
    "id": 2,
    "registration_number": "KIA-001-0002",
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "birth_date": "1985-03-20",
    "address": "Av. Principal, 456, São Paulo, SP",
    "dojo_id": 1,
    "dojo_name": "Florianópolis Ki-Aikido Dojo",
    "registration_date": "2025-08-11T15:30:00.000000",
    "started_practicing_year": 2023,
    "status": "active",
    "notes": "Observações sobre a aluna",
    "created_at": "2025-08-11T15:30:00.000000",
    "updated_at": "2025-08-11T15:30:00.000000"
  }
}
```

### Obter Aluno
Retorna detalhes de um aluno específico.

```http
GET /api/students/{id}
```

**Response (200):**
```json
{
  "student": {
    "id": 1,
    "registration_number": "KIA-001-0001",
    "name": "João Silva",
    "email": "joao@teste.com",
    "birth_date": "1990-05-15",
    "address": "Rua das Flores, 123, Florianópolis, SC",
    "dojo_id": 1,
    "dojo_name": "Florianópolis Ki-Aikido Dojo",
    "registration_date": "2025-08-11T12:51:45.961632",
    "started_practicing_year": null,
    "status": "active",
    "notes": null,
    "created_at": "2025-08-11T12:51:45.963032",
    "updated_at": "2025-08-11T12:51:45.963034"
  }
}
```

### Atualizar Aluno
Atualiza informações de um aluno.

```http
PUT /api/students/{id}
```

**Request Body:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.santos@teste.com",
  "birth_date": "1990-05-15",
  "address": "Rua das Flores, 123, Apt 45, Florianópolis, SC",
  "dojo_id": 1,
  "started_practicing_year": 2022,
  "status": "active",
  "notes": "Aluno dedicado"
}
```

**Response (200):**
```json
{
  "message": "Student updated successfully",
  "student": {
    // ... dados atualizados do aluno
  }
}
```

### Excluir Aluno
Remove um aluno do sistema.

```http
DELETE /api/students/{id}
```

**Response (200):**
```json
{
  "message": "Student deleted successfully"
}
```

### Estatísticas de Alunos
Retorna estatísticas dos alunos.

```http
GET /api/students/stats
```

**Response (200):**
```json
{
  "stats": {
    "total": 48,
    "active": 42,
    "pending": 4,
    "inactive": 2,
    "by_dojo": {
      "1": {"name": "Florianópolis Ki-Aikido Dojo", "count": 14},
      "2": {"name": "CDKI Dojo", "count": 10},
      "3": {"name": "Bagé Ki-Aikido Dojo", "count": 10},
      "4": {"name": "Shukikan Dojo", "count": 7},
      "5": {"name": "Belo Horizonte Ki-Aikido Dojo", "count": 4},
      "6": {"name": "Rio de Janeiro Ki-Aikido Dojo", "count": 3}
    }
  }
}
```

## 🏢 Gestão de Dojos

### Listar Dojos
Lista todos os dojos disponíveis.

```http
GET /api/dojos
```

**Response (200):**
```json
{
  "dojos": [
    {
      "id": 1,
      "name": "Florianópolis Ki-Aikido Dojo",
      "address": "Florianópolis, SC",
      "contact_email": "florianopolis@kiaikido.com",
      "contact_phone": null,
      "is_active": true,
      "created_at": "2025-08-11T12:41:49.000000",
      "updated_at": "2025-08-11T12:41:49.000000"
    }
  ]
}
```

### Obter Dojo
Retorna detalhes de um dojo específico.

```http
GET /api/dojos/{id}
```

**Response (200):**
```json
{
  "dojo": {
    "id": 1,
    "name": "Florianópolis Ki-Aikido Dojo",
    "address": "Florianópolis, SC",
    "contact_email": "florianopolis@kiaikido.com",
    "contact_phone": null,
    "is_active": true,
    "student_count": 14,
    "created_at": "2025-08-11T12:41:49.000000",
    "updated_at": "2025-08-11T12:41:49.000000"
  }
}
```

## 🏥 Health Check

### Verificar Status
Verifica se a API está funcionando.

```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-11T15:30:00.000000",
  "version": "1.0.0",
  "database": "connected"
}
```

## 📊 Modelos de Dados

### User (Usuário)
```json
{
  "id": "integer",
  "name": "string",
  "email": "string (unique)",
  "role": "string (admin|dojo_user)",
  "dojo_id": "integer|null",
  "dojo_name": "string|null",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Student (Aluno)
```json
{
  "id": "integer",
  "registration_number": "string (unique, auto-generated)",
  "name": "string",
  "email": "string",
  "birth_date": "date",
  "address": "string",
  "dojo_id": "integer",
  "dojo_name": "string",
  "registration_date": "datetime",
  "started_practicing_year": "integer|null",
  "status": "string (active|pending|inactive)",
  "notes": "string|null",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Dojo
```json
{
  "id": "integer",
  "name": "string",
  "address": "string",
  "contact_email": "string",
  "contact_phone": "string|null",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## 📋 Códigos de Status

### Sucesso
- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso

### Erro do Cliente
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação

### Erro do Servidor
- `500 Internal Server Error` - Erro interno

### Formato de Erro
```json
{
  "error": "Mensagem de erro",
  "details": {
    "field": ["Lista de erros específicos"]
  }
}
```

## 💡 Exemplos de Uso

### Exemplo Completo: Criar e Listar Alunos

```bash
#!/bin/bash

# 1. Fazer login
curl -s -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kiaikido.com",
    "password": "123456"
  }'

# 2. Criar novo aluno
curl -s -b cookies.txt -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Costa",
    "email": "ana@exemplo.com",
    "birth_date": "1992-07-10",
    "address": "Rua das Palmeiras, 789, Curitiba, PR",
    "dojo_id": 1,
    "status": "active"
  }' | python3 -m json.tool

# 3. Listar todos os alunos
curl -s -b cookies.txt http://localhost:5000/api/students | python3 -m json.tool

# 4. Buscar alunos por nome
curl -s -b cookies.txt "http://localhost:5000/api/students?search=Ana" | python3 -m json.tool

# 5. Obter estatísticas
curl -s -b cookies.txt http://localhost:5000/api/students/stats | python3 -m json.tool

# 6. Fazer logout
curl -s -b cookies.txt -X POST http://localhost:5000/api/auth/logout
```

### Exemplo Python

```python
import requests
import json

# Configuração
BASE_URL = "http://localhost:5000/api"
session = requests.Session()

# 1. Login
login_data = {
    "email": "admin@kiaikido.com",
    "password": "123456"
}

response = session.post(f"{BASE_URL}/auth/login", json=login_data)
if response.status_code == 200:
    print("✅ Login realizado com sucesso")
    user = response.json()["user"]
    print(f"👤 Usuário: {user['name']} ({user['role']})")
else:
    print("❌ Erro no login")
    exit(1)

# 2. Criar aluno
student_data = {
    "name": "Pedro Oliveira",
    "email": "pedro@exemplo.com",
    "birth_date": "1988-12-05",
    "address": "Av. Brasil, 1000, Rio de Janeiro, RJ",
    "dojo_id": 6,
    "status": "active"
}

response = session.post(f"{BASE_URL}/students", json=student_data)
if response.status_code == 201:
    student = response.json()["student"]
    print(f"✅ Aluno criado: {student['name']} - {student['registration_number']}")
else:
    print("❌ Erro ao criar aluno")

# 3. Listar alunos
response = session.get(f"{BASE_URL}/students")
if response.status_code == 200:
    data = response.json()
    print(f"📊 Total de alunos: {data['pagination']['total']}")
    for student in data['students']:
        print(f"  - {student['name']} ({student['registration_number']})")

# 4. Obter estatísticas
response = session.get(f"{BASE_URL}/students/stats")
if response.status_code == 200:
    stats = response.json()["stats"]
    print(f"📈 Estatísticas:")
    print(f"  Total: {stats['total']}")
    print(f"  Ativos: {stats['active']}")
    print(f"  Pendentes: {stats['pending']}")

# 5. Logout
session.post(f"{BASE_URL}/auth/logout")
print("👋 Logout realizado")
```

### Exemplo JavaScript (Frontend)

```javascript
// Configuração
const API_BASE = 'http://localhost:5000/api';

// Função auxiliar para requisições
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
}

// Exemplo de uso
async function exemploCompleto() {
    try {
        // 1. Login
        const loginResult = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@kiaikido.com',
                password: '123456'
            }),
        });
        
        console.log('✅ Login realizado:', loginResult.user.name);

        // 2. Criar aluno
        const novoAluno = await apiRequest('/students', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Carlos Mendes',
                email: 'carlos@exemplo.com',
                birth_date: '1995-04-18',
                address: 'Rua das Acácias, 321, Salvador, BA',
                dojo_id: 1,
                status: 'active'
            }),
        });
        
        console.log('✅ Aluno criado:', novoAluno.student.registration_number);

        // 3. Listar alunos
        const alunos = await apiRequest('/students');
        console.log(`📊 Total de alunos: ${alunos.pagination.total}`);

        // 4. Buscar aluno específico
        const busca = await apiRequest('/students?search=Carlos');
        console.log('🔍 Resultado da busca:', busca.students.length);

        // 5. Obter estatísticas
        const stats = await apiRequest('/students/stats');
        console.log('📈 Estatísticas:', stats.stats);

    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Executar exemplo
exemploCompleto();
```

---

## 📞 Suporte

Para dúvidas sobre a API:

1. Verifique se o servidor está rodando (`./status.sh`)
2. Teste o health check: `curl http://localhost:5000/api/health`
3. Consulte os logs do servidor
4. Abra uma issue no GitHub com detalhes da requisição

**Base URL de desenvolvimento**: `http://localhost:5000/api` 🚀

