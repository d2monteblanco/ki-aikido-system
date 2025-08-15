# Sistema Ki Aikido - Processo de Instalação Corrigido

## 🔧 Correções Implementadas

### 1. **Frontend Atualizado**
- ✅ Todas as referências agora apontam para `ki-aikido-enhanced.html`
- ✅ Removidas referências ao arquivo obsoleto `ki-aikido-simple.html`
- ✅ Interface completa com gestão de status e graduações

### 2. **Migrações de Banco de Dados**
- ✅ Script de instalação executa migrações das novas tabelas
- ✅ Script de atualização inclui migrações automáticas
- ✅ Suporte completo às tabelas de membros e graduações

### 3. **Configuração Centralizada**
- ✅ Novo arquivo `config.sh` com configurações centralizadas
- ✅ Funções utilitárias para verificação de dependências
- ✅ Gerenciamento inteligente de portas

### 4. **Scripts Melhorados**
- ✅ `start.sh` - Limpeza robusta de processos
- ✅ `status.sh` - Verificação completa do sistema
- ✅ `update.sh` - Migrações automáticas
- ✅ `install.sh` - Processo completo de instalação

## 📋 Processo de Instalação Atualizado

### **Instalação Rápida**
```bash
# Clonar repositório
git clone https://github.com/d2monteblanco/ki-aikido-system.git
cd ki-aikido-system

# Executar instalação
./scripts/install.sh
```

### **Instalação Manual**
```bash
# 1. Instalar dependências do sistema
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv python3-dev build-essential curl wget git sqlite3

# 2. Criar ambiente virtual
cd backend
python3 -m venv venv
source venv/bin/activate

# 3. Instalar dependências Python
pip install --upgrade pip
pip install -r requirements.txt

# 4. Inicializar banco de dados
python3 -c "
import sys
sys.path.append('.')
from src.main import app, init_database
with app.app_context():
    init_database()
"

# 5. Executar migrações
python3 src/migrations/add_member_status_tables.py

# 6. Voltar ao diretório raiz
cd ..
```

## 🚀 Como Usar

### **Iniciar Sistema**
```bash
./start.sh
```

### **Verificar Status**
```bash
./status.sh
```

### **Parar Sistema**
```bash
./stop.sh
```

### **Atualizar Sistema**
```bash
./update.sh
```

## 🌐 Acesso ao Sistema

### **Backend (API)**
- URL: http://localhost:5000
- Health Check: http://localhost:5000/api/health

### **Frontend**
- Arquivo: `frontend/ki-aikido-enhanced.html`
- Abrir no navegador: `file:///caminho/para/ki-aikido-system/frontend/ki-aikido-enhanced.html`

### **Credenciais de Teste**
- **Administrador**: admin@kiaikido.com / 123456
- **Dojo Florianópolis**: florianopolis@kiaikido.com / 123456

## 📊 Funcionalidades Disponíveis

### **Dashboard**
- Visão geral do sistema
- Estatísticas de alunos e membros
- Informações dos dojos

### **Gestão de Alunos**
- Cadastro completo de alunos
- Informações pessoais e de contato
- Vinculação com dojos

### **Status e Graduações**
- Gestão de status de membros
- Histórico completo de graduações
- Suporte a Shinshin Toitsudo e Shinshin Toitsu Aikido
- Sistema de certificados

## 🔧 Configurações Avançadas

### **Arquivo de Configuração**
O arquivo `config.sh` contém configurações centralizadas:
- Porta do servidor (padrão: 5000)
- Host (padrão: 127.0.0.1)
- Caminhos dos arquivos
- Funções utilitárias

### **Variáveis de Ambiente**
```bash
# Carregar configurações
source config.sh

# Verificar dependências
check_dependencies

# Exibir informações
show_info
```

## 🛠️ Solução de Problemas

### **Porta Ocupada**
```bash
# Verificar processos na porta 5000
lsof -ti:5000

# Limpar processos
source config.sh
cleanup_processes
```

### **Banco de Dados**
```bash
# Verificar banco
ls -la backend/src/database/app.db

# Reinicializar banco (CUIDADO: apaga dados)
cd backend
rm -f src/database/app.db
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"
python3 src/migrations/add_member_status_tables.py
```

### **Dependências**
```bash
# Reinstalar dependências
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 📚 Estrutura do Projeto

```
ki-aikido-system/
├── backend/                 # Backend Flask
│   ├── src/
│   │   ├── main.py         # Aplicação principal
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── migrations/     # Scripts de migração
│   │   └── database/       # Banco de dados SQLite
│   ├── venv/               # Ambiente virtual Python
│   └── requirements.txt    # Dependências Python
├── frontend/               # Frontend HTML/JS
│   └── ki-aikido-enhanced.html
├── scripts/                # Scripts de instalação
│   ├── install.sh         # Instalação completa
│   └── quick-install.sh   # Instalação rápida
├── config.sh              # Configurações centralizadas
├── start.sh               # Iniciar sistema
├── stop.sh                # Parar sistema
├── status.sh              # Verificar status
└── update.sh              # Atualizar sistema
```

## ✅ Checklist de Verificação

Após a instalação, verifique:

- [ ] Ambiente virtual criado em `backend/venv/`
- [ ] Banco de dados em `backend/src/database/app.db`
- [ ] Frontend em `frontend/ki-aikido-enhanced.html`
- [ ] Servidor responde em http://localhost:5000
- [ ] Login funciona com credenciais de teste
- [ ] Todas as abas carregam (Dashboard, Alunos, Status/Graduações)
- [ ] Scripts de controle funcionam (`./start.sh`, `./stop.sh`, `./status.sh`)

## 🆘 Suporte

Em caso de problemas:

1. Execute `./status.sh` para diagnóstico
2. Verifique logs do servidor
3. Consulte a documentação da API
4. Verifique se todas as dependências estão instaladas

O sistema Ki Aikido agora está completamente funcional e pronto para uso! 🥋

