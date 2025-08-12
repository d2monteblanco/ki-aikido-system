# 📦 Guia de Instalação - Sistema Ki Aikido

Este guia fornece instruções detalhadas para instalar o Sistema Ki Aikido em diferentes ambientes Ubuntu.

## 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Instalação Automática](#-instalação-automática)
- [Instalação Manual](#-instalação-manual)
- [Configuração Avançada](#-configuração-avançada)
- [Solução de Problemas](#-solução-de-problemas)
- [Desinstalação](#-desinstalação)

## 🔧 Pré-requisitos

### Sistema Operacional
- Ubuntu 18.04 LTS ou superior
- Debian 10 ou superior
- WSL2 com Ubuntu (Windows 11)

### Hardware Mínimo
- **RAM**: 2GB (recomendado 4GB)
- **Disco**: 1GB de espaço livre
- **CPU**: Qualquer processador x64

### Dependências Básicas
```bash
# Verificar versão do Ubuntu
lsb_release -a

# Verificar Python
python3 --version  # Deve ser 3.8+

# Verificar Git
git --version
```

## 🚀 Instalação Automática

### Opção 1: Script de Instalação Rápida (Recomendado)
```bash
# Download e execução em uma linha
curl -sSL https://raw.githubusercontent.com/d2monteblanco/ki-aikido-system/main/scripts/quick-install.sh | bash
```

### Opção 2: Clone + Instalação
```bash
# 1. Clonar repositório
git clone https://github.com/d2monteblanco/ki-aikido-system.git
cd ki-aikido-system

# 2. Executar instalação
./scripts/install.sh
```

### O que o Script Faz
1. ✅ Atualiza o sistema Ubuntu
2. ✅ Instala dependências do sistema (Python, Git, SQLite, etc.)
3. ✅ Cria ambiente virtual Python
4. ✅ Instala dependências Python
5. ✅ Inicializa banco de dados com dados de exemplo
6. ✅ Cria scripts de controle (start, stop, update, status)
7. ✅ Configura firewall (porta 5000)
8. ✅ Cria usuários de demonstração

## 🔨 Instalação Manual

### Passo 1: Preparar Sistema
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    curl \
    wget \
    git \
    sqlite3 \
    nginx \
    supervisor \
    ufw
```

### Passo 2: Clonar Repositório
```bash
# Escolher diretório de instalação
cd $HOME

# Clonar projeto
git clone https://github.com/d2monteblanco/ki-aikido-system.git
cd ki-aikido-system
```

### Passo 3: Configurar Backend
```bash
# Entrar no diretório backend
cd backend

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt
```

### Passo 4: Configurar Banco de Dados
```bash
# Criar diretório do banco
mkdir -p database

# Inicializar banco com dados de exemplo
python3 -c "
import sys
sys.path.append('.')
from src.main import app, init_database
with app.app_context():
    init_database()
print('✅ Banco de dados inicializado!')
"
```

### Passo 5: Criar Configuração Local
```bash
# Voltar ao diretório raiz
cd ..

# Criar arquivo de configuração
cat > .env << EOF
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///database/app.db
SECRET_KEY=ki-aikido-local-$(date +%s)
PORT=5000
HOST=127.0.0.1
EOF
```

### Passo 6: Criar Scripts de Controle
```bash
# Script de inicialização
cat > start.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR/backend"
source venv/bin/activate
echo "🚀 Iniciando Sistema Ki Aikido..."
echo "📱 Frontend: file://$PROJECT_DIR/frontend/ki-aikido-simple.html"
echo "🌐 Backend: http://localhost:5000"
python3 src/main.py
EOF

chmod +x start.sh

# Script de parada
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Parando Sistema Ki Aikido..."
pkill -f "python3 src/main.py" 2>/dev/null || true
echo "✅ Sistema parado."
EOF

chmod +x stop.sh
```

### Passo 7: Testar Instalação
```bash
# Iniciar sistema
./start.sh

# Em outro terminal, testar API
curl http://localhost:5000/api/health
```

## ⚙️ Configuração Avançada

### Configuração de Produção

#### 1. Usar PostgreSQL (Opcional)
```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Criar banco de dados
sudo -u postgres createdb kiaikido
sudo -u postgres createuser kiaikido_user

# Configurar senha
sudo -u postgres psql -c "ALTER USER kiaikido_user PASSWORD 'sua_senha_segura';"

# Atualizar .env
echo "DATABASE_URL=postgresql://kiaikido_user:sua_senha_segura@localhost/kiaikido" >> .env
```

#### 2. Configurar Nginx (Opcional)
```bash
# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/kiaikido << EOF
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/kiaikido /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Configurar Supervisor (Opcional)
```bash
# Criar configuração do Supervisor
sudo tee /etc/supervisor/conf.d/kiaikido.conf << EOF
[program:kiaikido]
command=/home/ubuntu/ki-aikido-system/backend/venv/bin/python src/main.py
directory=/home/ubuntu/ki-aikido-system/backend
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/kiaikido.log
EOF

# Recarregar configuração
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start kiaikido
```

### Configuração de Firewall
```bash
# Permitir porta 5000
sudo ufw allow 5000/tcp

# Se usar Nginx
sudo ufw allow 'Nginx Full'

# Verificar status
sudo ufw status
```

### Backup Automático
```bash
# Criar script de backup
cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups/kiaikido"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup do banco de dados
cp backend/database/app.db "$BACKUP_DIR/app_$DATE.db"

# Backup de configurações
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" .env backend/src/

echo "✅ Backup criado: $BACKUP_DIR"
EOF

chmod +x scripts/backup.sh

# Configurar cron para backup diário
(crontab -l 2>/dev/null; echo "0 2 * * * $PWD/scripts/backup.sh") | crontab -
```

## 🔍 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Permissão
```bash
# Problema: Permission denied
# Solução: Não execute como root
whoami  # Deve mostrar seu usuário, não 'root'

# Se executou como root, corrigir permissões
sudo chown -R $USER:$USER ki-aikido-system/
```

#### 2. Porta 5000 em Uso
```bash
# Verificar o que está usando a porta
sudo lsof -i :5000

# Matar processo se necessário
sudo kill -9 PID_DO_PROCESSO

# Ou usar porta diferente
export PORT=5001
./start.sh
```

#### 3. Erro de Dependências Python
```bash
# Recriar ambiente virtual
rm -rf backend/venv
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Banco de Dados Corrompido
```bash
# Backup do banco atual (se possível)
cp backend/database/app.db backend/database/app.db.backup

# Recriar banco
rm backend/database/app.db
cd backend
source venv/bin/activate
python3 -c "
from src.main import app, init_database
with app.app_context():
    init_database()
"
```

#### 5. Erro de Módulo Não Encontrado
```bash
# Verificar se está no ambiente virtual
which python3  # Deve apontar para venv/bin/python3

# Reativar ambiente virtual
cd backend
source venv/bin/activate

# Verificar instalação
pip list | grep -i flask
```

### Logs e Debug

#### Verificar Status
```bash
# Status completo do sistema
./status.sh

# Verificar processos
ps aux | grep python3

# Verificar portas
netstat -tlnp | grep :5000
```

#### Modo Debug
```bash
# Ativar debug
export FLASK_DEBUG=1
export FLASK_ENV=development

# Iniciar com logs detalhados
./start.sh
```

#### Logs Personalizados
```bash
# Criar diretório de logs
mkdir -p backend/logs

# Iniciar com log em arquivo
cd backend
source venv/bin/activate
python3 src/main.py > logs/app.log 2>&1 &

# Acompanhar logs
tail -f backend/logs/app.log
```

### Verificação de Integridade

#### Testar API
```bash
# Health check
curl -s http://localhost:5000/api/health | python3 -m json.tool

# Testar login
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kiaikido.com","password":"123456"}' \
  -c cookies.txt | python3 -m json.tool

# Testar listagem de alunos
curl -s -b cookies.txt http://localhost:5000/api/students | python3 -m json.tool
```

#### Testar Frontend
```bash
# Verificar se arquivo existe
ls -la frontend/ki-aikido-simple.html

# Abrir no navegador padrão (se disponível)
xdg-open frontend/ki-aikido-simple.html 2>/dev/null || \
echo "Abra manualmente: file://$(pwd)/frontend/ki-aikido-simple.html"
```

## 🗑️ Desinstalação

### Desinstalação Completa
```bash
# Parar sistema
./stop.sh

# Remover do supervisor (se configurado)
sudo supervisorctl stop kiaikido
sudo rm /etc/supervisor/conf.d/kiaikido.conf
sudo supervisorctl reread

# Remover do nginx (se configurado)
sudo rm /etc/nginx/sites-enabled/kiaikido
sudo rm /etc/nginx/sites-available/kiaikido
sudo systemctl reload nginx

# Remover regras do firewall
sudo ufw delete allow 5000/tcp

# Remover diretório do projeto
cd ..
rm -rf ki-aikido-system/

# Remover backups (opcional)
rm -rf $HOME/backups/kiaikido/
```

### Desinstalação Parcial (Manter Dados)
```bash
# Parar sistema
./stop.sh

# Fazer backup dos dados
mkdir -p $HOME/kiaikido-backup
cp backend/database/app.db $HOME/kiaikido-backup/
cp .env $HOME/kiaikido-backup/

# Remover código
rm -rf backend/src/ frontend/ scripts/
```

---

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os [problemas comuns](#problemas-comuns) acima
2. Execute `./status.sh` para diagnóstico
3. Consulte os logs em `backend/logs/`
4. Abra uma issue no GitHub com detalhes do erro

**Instalação bem-sucedida? Execute `./start.sh` e acesse o sistema!** 🎉

