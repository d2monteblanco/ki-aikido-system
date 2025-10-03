# ☕ Sistema Ki Aikido

Sistema completo para gestão centralizada de academias de Ki Aikido no Brasil, com controle de acesso por dojo e funcionalidades específicas para processos burocráticos com o Japão.

## 📋 Índice

- [Características](#-características)
- [Instalação Rápida](#-instalação-rápida)
- [Instalação Manual](#-instalação-manual)
- [Como Usar](#-como-usar)
- [Atualização](#-atualização)
- [Desenvolvimento](#-desenvolvimento)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API](#-api)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## ✨ Características

### 🔐 **Controle de Acesso**
- **Administradores**: Acesso completo a todos os dojos e Cadastros Básicos
- **Usuários de Dojo**: Acesso restrito apenas aos Cadastros Básicos do seu dojo
- Autenticação segura com sessões

### 💥 **Gestão de Cadastros Básicos**
- Cadastro completo baseado na planilha real de inscrições
- Geração automática de números de registro (formato KIA-XXX-XXXX)
- Busca e filtros avançados
- Status de Cadastros Básicos (Ativo, Pendente, Inativo)
- Controle de dados para processos com o Japão

### 🏢 **Gestão de Dojos**
- 6 dojos pré-configurados baseados em dados reais
- Estatísticas por dojo
- Controle de usuários por dojo

### 📊 **Dashboard**
- Estatísticas em tempo real
- Visão geral do sistema
- Métricas por dojo

### 🎨 **Interface Moderna**
- Design responsivo (desktop/tablet/mobile)
- Interface intuitiva com Tailwind CSS
- Componentes interativos

## 🚀 Instalação Rápida

### Opção 1: Script de Instalação Automática
```bash
curl -sSL https://raw.githubusercontent.com/d2monteblanco/ki-aikido-system/main/scripts/quick-install.sh | bash
```

### Opção 2: Clone Manual
```bash
# 1. Clonar repositório
git clone https://github.com/d2monteblanco/ki-aikido-system.git
cd ki-aikido-system

# 2. Executar instalação
./scripts/install.sh

# 3. Iniciar sistema
./start.sh
```

## 📦 Instalação Manual

### Pré-requisitos
- Ubuntu 18.04+ ou Debian 10+
- Python 3.8+
- Git

### Dependências do Sistema
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git sqlite3 curl wget
```

### Configuração
```bash
# 1. Clonar repositório
git clone https://github.com/d2monteblanco/ki-aikido-system.git
cd ki-aikido-system

# 2. Criar ambiente virtual
cd backend
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependências Python
pip install -r requirements.txt

# 4. Inicializar banco de dados
python3 -c "
from src.main import app, init_database
with app.app_context():
    init_database()
"

# 5. Iniciar sistema
cd ..
./start.sh
```

## 🎫 Como Usar

### 1. Iniciar o Sistema
```bash
./start.sh
```

### 2. Acessar a Interface
- **Backend API**: http://localhost:5000
- **Frontend**: Para acessar o frontend, você deve servi-lo através de um servidor HTTP. Navegue até o diretório `ki-aikido-system` e execute:
  ```bash
  python3 -m http.server 8080 --directory frontend
  ```
  Após iniciar o servidor, acesse o frontend em seu navegador através de: `http://localhost:8080/index.html`

### 3. Login
Use uma das credenciais de demonstração:

**Administrador (vê todos os dojos):**
- Email: `admin@kiaikido.com`
- Senha: `123456`

**Usuários de Dojo:**
- `florianopolis@kiaikido.com` / `123456` (Dojo Florianópolis)
- `cdki@kiaikido.com` / `123456` (Dojo CDKI)
- `bage@kiaikido.com` / `123456` (Dojo Bagé)
- `shukikan@kiaikido.com` / `123456` (Dojo Shukikan)
- `belohorizonte@kiaikido.com` / `123456` (Dojo Belo Horizonte)
- `rio@kiaikido.com` / `123456` (Dojo Rio de Janeiro)

### 4. Funcionalidades Principais
- **Dashboard**: Visualizar estatísticas gerais
- **Gestão de Cadastros Básicos**: Cadastrar, editar, buscar Cadastros Básicos
- **Controle de Acesso**: Cada dojo vê apenas seus Cadastros Básicos
- **Relatórios**: Exportar dados para processos burocráticos

## 🔄 Atualização

Para atualizar o sistema com as últimas mudanças:

```bash
./update.sh
```

Este script irá:
1. Fazer backup do banco de dados
2. Baixar atualizações do GitHub
3. Atualizar dependências
4. Aplicar migrações de banco
5. Reiniciar o sistema

## 🛠️ Desenvolvimento

### Configurar Ambiente de Desenvolvimento
```bash
./scripts/dev-setup.sh
```

### Comandos Úteis
```bash
# Executar testes
make test

# Verificar código
make lint

# Formatar código
make format

# Executar aplicação
make run

# Verificar status
./status.sh
```

### Estrutura de Testes
```bash
# Executar todos os testes
cd backend
source venv/bin/activate
pytest

# Executar com cobertura
pytest --cov=src
```

## 🗁 Estrutura do Projeto

```
ki-aikido-system/
├── backend/                 # Backend Flask
│   ├── src/
│   │   ├── models/         # Modelos do banco de dados
│   │   ├── routes/         # Rotas da API
│   │   └── main.py         # Aplicação principal
│   ├── tests/              # Testes automatizados
│   ├── database/           # Banco de dados SQLite
│   └── requirements.txt    # Dependências Python
├── frontend/               # Frontend HTML/JS
│   └── index.html
├── scripts/                # Scripts de automação
│   ├── install.sh         # Instalação completa
│   ├── quick-install.sh   # Instalação rápida
│   └── dev-setup.sh       # Ambiente de desenvolvimento
├── docs/                   # Documentação
├── data/                   # Dados de exemplo
├── start.sh               # Iniciar sistema
├── stop.sh                # Parar sistema
├── update.sh              # Atualizar sistema
├── status.sh              # Verificar status
└── README.md              # Este arquivo
```

## 🔌 API

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário atual

#### Cadastros Básicos
- `GET /api/students` - Listar Cadastros Básicos (com paginação e filtros)
- `POST /api/students` - Criar Cadastros Básicos
- `GET /api/students/{id}` - Detalhes do Cadastro Básico
- `PUT /api/students/{id}` - Atualizar Cadastro Básico
- `DELETE /api/students/{id}` - Excluir Cadastro Básico
- `GET /api/students/stats` - Estatísticas

#### Dojos
- `GET /api/dojos` - Listar dojos
- `GET /api/dojos/{id}` - Detalhes do dojo

### Exemplo de Uso da API
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kiaikido.com","password":"123456"}' \
  -c cookies.txt

# Listar Cadastros Básicos
curl -X GET http://localhost:5000/api/students \
  -b cookies.txt

# Criar Cadastro Básico
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "birth_date": "1990-05-15",
    "address": "Rua das Flores, 123",
    "dojo_id": 1,
    "status": "active"
  }'
```

## 💝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Configure o ambiente de desenvolvimento (`./scripts/dev-setup.sh`)
4. Faça suas alterações
5. Execute os testes (`make test`)
6. Formate o código (`make format`)
7. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
8. Push para a branch (`git push origin feature/nova-funcionalidade`)
9. Abra um Pull Request

### Padrões de Código
- Python: PEP 8 (formatado com Black)
- Testes: pytest
- Commits: Conventional Commits

## 📜 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Problemas Comuns

**Erro de permissão ao instalar:**
```bash
# Não execute como root, use seu usuário normal
./scripts/install.sh
```

**Porta 5000 já em uso:**
```bash
# Verificar processos na porta
sudo lsof -i :5000

# Matar processo se necessário
sudo kill -9 PID
```

**Banco de dados corrompido:**
```bash
# Remover banco e recriar
rm backend/database/app.db
cd backend
source venv/bin/activate
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"
```

### Logs e Debug
```bash
# Verificar status detalhado
./status.sh

# Logs do sistema
tail -f backend/logs/app.log  # Se configurado

# Debug mode
export FLASK_DEBUG=1
./start.sh
```

---

**Desenvolvido com ❤️ para a comunidade Ki Aikido Brasil**
