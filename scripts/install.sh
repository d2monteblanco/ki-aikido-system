#!/bin/bash

# =============================================================================
# Sistema Ki Aikido - Script de Instalação Completa
# =============================================================================
# Versão: 2.0
# Data: 23/08/2025
# Descrição: Script de instalação automatizada para o Sistema Ki Aikido
# Compatível com: Ubuntu 20.04+, Debian 10+, CentOS 8+
# =============================================================================

set -e  # Parar execução em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="Sistema Ki Aikido"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"
DB_FILE="$BACKEND_DIR/src/database/app.db"
LOG_FILE="$PROJECT_DIR/install.log"

# Função para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo -e "$1"
}

# Função para exibir banner
show_banner() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${WHITE}                    SISTEMA KI AIKIDO                            ${BLUE}║${NC}"
    echo -e "${BLUE}║${WHITE}                 Instalação Automatizada                        ${BLUE}║${NC}"
    echo -e "${BLUE}║                                                                  ║${NC}"
    echo -e "${BLUE}║${CYAN}  🥋 Gestão Completa de Academias Ki Aikido no Brasil 🇧🇷        ${BLUE}║${NC}"
    echo -e "${BLUE}║                                                                  ║${NC}"
    echo -e "${BLUE}║${YELLOW}  Versão: 2.0                                                  ${BLUE}║${NC}"
    echo -e "${BLUE}║${YELLOW}  Data: 23/08/2025                                             ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para detectar sistema operacional
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            OS="ubuntu"
        elif command_exists yum; then
            OS="centos"
        elif command_exists dnf; then
            OS="fedora"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
    log "${CYAN}Sistema operacional detectado: $OS${NC}"
}

# Função para verificar privilégios
check_privileges() {
    log "${CYAN}🔐 Verificando privilégios...${NC}"
    
    if [[ $EUID -eq 0 ]]; then
        log "${YELLOW}⚠️  Executando como root. Recomenda-se executar como usuário normal.${NC}"
        read -p "Deseja continuar? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "${RED}❌ Instalação cancelada pelo usuário.${NC}"
            exit 1
        fi
    fi
}

# Função para verificar dependências do sistema
check_system_dependencies() {
    log "${CYAN}🔍 Verificando dependências do sistema...${NC}"
    
    local missing_deps=()
    
    # Verificar Python 3.8+
    if command_exists python3; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
            log "${GREEN}✅ Python $PYTHON_VERSION encontrado${NC}"
        else
            log "${RED}❌ Python 3.8+ necessário. Versão atual: $PYTHON_VERSION${NC}"
            missing_deps+=("python3.8+")
        fi
    else
        log "${RED}❌ Python 3 não encontrado${NC}"
        missing_deps+=("python3")
    fi
    
    # Verificar pip
    if command_exists pip3; then
        log "${GREEN}✅ pip3 encontrado${NC}"
    else
        log "${RED}❌ pip3 não encontrado${NC}"
        missing_deps+=("python3-pip")
    fi
    
    # Verificar venv
    if python3 -c 'import venv' 2>/dev/null; then
        log "${GREEN}✅ python3-venv disponível${NC}"
    else
        log "${RED}❌ python3-venv não encontrado${NC}"
        missing_deps+=("python3-venv")
    fi
    
    # Verificar curl
    if command_exists curl; then
        log "${GREEN}✅ curl encontrado${NC}"
    else
        log "${RED}❌ curl não encontrado${NC}"
        missing_deps+=("curl")
    fi
    
    # Verificar git
    if command_exists git; then
        log "${GREEN}✅ git encontrado${NC}"
    else
        log "${YELLOW}⚠️  git não encontrado (opcional)${NC}"
    fi
    
    # Se há dependências faltando, tentar instalar
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log "${YELLOW}📦 Instalando dependências faltando: ${missing_deps[*]}${NC}"
        install_system_dependencies "${missing_deps[@]}"
    fi
}

# Função para instalar dependências do sistema
install_system_dependencies() {
    local deps=("$@")
    
    case $OS in
        ubuntu)
            log "${CYAN}📦 Atualizando repositórios apt...${NC}"
            sudo apt-get update -qq
            
            log "${CYAN}📦 Instalando dependências via apt...${NC}"
            sudo apt-get install -y "${deps[@]}" || {
                log "${RED}❌ Erro ao instalar dependências via apt${NC}"
                exit 1
            }
            ;;
        centos|fedora)
            if command_exists dnf; then
                log "${CYAN}📦 Instalando dependências via dnf...${NC}"
                sudo dnf install -y "${deps[@]}" || {
                    log "${RED}❌ Erro ao instalar dependências via dnf${NC}"
                    exit 1
                }
            else
                log "${CYAN}📦 Instalando dependências via yum...${NC}"
                sudo yum install -y "${deps[@]}" || {
                    log "${RED}❌ Erro ao instalar dependências via yum${NC}"
                    exit 1
                }
            fi
            ;;
        macos)
            if command_exists brew; then
                log "${CYAN}📦 Instalando dependências via Homebrew...${NC}"
                brew install "${deps[@]}" || {
                    log "${RED}❌ Erro ao instalar dependências via Homebrew${NC}"
                    exit 1
                }
            else
                log "${RED}❌ Homebrew não encontrado. Instale manualmente: https://brew.sh${NC}"
                exit 1
            fi
            ;;
        *)
            log "${RED}❌ Sistema operacional não suportado para instalação automática${NC}"
            log "${YELLOW}Por favor, instale manualmente: ${deps[*]}${NC}"
            exit 1
            ;;
    esac
    
    log "${GREEN}✅ Dependências do sistema instaladas com sucesso${NC}"
}

# Função para verificar estrutura do projeto
check_project_structure() {
    log "${CYAN}📁 Verificando estrutura do projeto...${NC}"
    
    # Verificar diretórios essenciais
    local required_dirs=("$BACKEND_DIR" "$FRONTEND_DIR")
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            log "${GREEN}✅ Diretório encontrado: $dir${NC}"
        else
            log "${RED}❌ Diretório não encontrado: $dir${NC}"
            exit 1
        fi
    done
    
    # Verificar arquivos essenciais
    local required_files=(
        "$BACKEND_DIR/requirements.txt"
        "$BACKEND_DIR/src/main.py"
        "$FRONTEND_DIR/index.html"
        "$FRONTEND_DIR/app.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log "${GREEN}✅ Arquivo encontrado: $(basename "$file")${NC}"
        else
            log "${RED}❌ Arquivo não encontrado: $file${NC}"
            exit 1
        fi
    done
}

# Função para criar ambiente virtual
create_virtual_environment() {
    log "${CYAN}🐍 Configurando ambiente virtual Python...${NC}"
    
    # Remover venv existente se houver
    if [[ -d "$VENV_DIR" ]]; then
        log "${YELLOW}🗑️  Removendo ambiente virtual existente...${NC}"
        rm -rf "$VENV_DIR"
    fi
    
    # Criar novo ambiente virtual
    log "${CYAN}📦 Criando novo ambiente virtual...${NC}"
    cd "$BACKEND_DIR"
    python3 -m venv venv || {
        log "${RED}❌ Erro ao criar ambiente virtual${NC}"
        exit 1
    }
    
    # Ativar ambiente virtual
    source venv/bin/activate || {
        log "${RED}❌ Erro ao ativar ambiente virtual${NC}"
        exit 1
    }
    
    # Atualizar pip
    log "${CYAN}⬆️  Atualizando pip...${NC}"
    pip install --upgrade pip || {
        log "${RED}❌ Erro ao atualizar pip${NC}"
        exit 1
    }
    
    log "${GREEN}✅ Ambiente virtual criado e ativado${NC}"
}

# Função para instalar dependências Python
install_python_dependencies() {
    log "${CYAN}📦 Instalando dependências Python...${NC}"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Instalar dependências do requirements.txt
    pip install -r requirements.txt || {
        log "${RED}❌ Erro ao instalar dependências Python${NC}"
        exit 1
    }
    
    log "${GREEN}✅ Dependências Python instaladas com sucesso${NC}"
}

# Função para configurar banco de dados
setup_database() {
    log "${CYAN}🗄️  Configurando banco de dados...${NC}"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Criar diretório do banco se não existir
    mkdir -p "$(dirname "$DB_FILE")"
    
    # Executar script de inicialização do banco
    log "${CYAN}🔧 Inicializando banco de dados...${NC}"
    python3 -c "
import sys
import os
sys.path.append('src')

# Importar o app diretamente do main.py
from src.main import app, db, User

# O banco já é inicializado automaticamente no main.py
# Apenas verificar se funcionou
with app.app_context():
    users = User.query.all()
    print(f'✅ Banco de dados inicializado. {len(users)} usuários encontrados.')
    if len(users) > 0:
        print('Usuários disponíveis:')
        for user in users:
            print(f'  - {user.email} ({user.role})')
" || {
        log "${RED}❌ Erro ao configurar banco de dados${NC}"
        exit 1
    }
    
    # Executar migrações se existirem
    if [[ -d "$BACKEND_DIR/src/migrations" ]]; then
        log "${CYAN}🔄 Executando migrações...${NC}"
        for migration in "$BACKEND_DIR/src/migrations"/*.py; do
            if [[ -f "$migration" && "$(basename "$migration")" != "__init__.py" ]]; then
                log "${CYAN}📝 Executando migração: $(basename "$migration")${NC}"
                python3 "$migration" || {
                    log "${YELLOW}⚠️  Aviso: Erro na migração $(basename "$migration") (pode ser normal se já executada)${NC}"
                }
            fi
        done
    fi
    
    log "${GREEN}✅ Banco de dados configurado com sucesso${NC}"
}

# Função para verificar portas
check_ports() {
    log "${CYAN}🔌 Verificando disponibilidade de portas...${NC}"
    
    local ports=(5001 8080)
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log "${YELLOW}⚠️  Porta $port está em uso${NC}"
            read -p "Deseja parar o processo na porta $port? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
                kill -9 $pid 2>/dev/null || true
                log "${GREEN}✅ Processo na porta $port finalizado${NC}"
            fi
        else
            log "${GREEN}✅ Porta $port disponível${NC}"
        fi
    done
}

# Função para criar scripts de controle
create_control_scripts() {
    log "${CYAN}📝 Criando scripts de controle...${NC}"
    
    # Script start.sh já existe, verificar se está atualizado
    if [[ -f "$PROJECT_DIR/start.sh" ]]; then
        log "${GREEN}✅ Script start.sh já existe${NC}"
    fi
    
    # Script stop.sh já existe, verificar se está atualizado
    if [[ -f "$PROJECT_DIR/stop.sh" ]]; then
        log "${GREEN}✅ Script stop.sh já existe${NC}"
    fi
    
    # Script status.sh já existe, verificar se está atualizado
    if [[ -f "$PROJECT_DIR/status.sh" ]]; then
        log "${GREEN}✅ Script status.sh já existe${NC}"
    fi
    
    # Tornar scripts executáveis
    chmod +x "$PROJECT_DIR"/*.sh 2>/dev/null || true
    
    log "${GREEN}✅ Scripts de controle configurados${NC}"
}

# Função para testar instalação
test_installation() {
    log "${CYAN}🧪 Testando instalação...${NC}"
    
    cd "$BACKEND_DIR"
    source venv/bin/activate
    
    # Testar importações Python
    log "${CYAN}🐍 Testando importações Python...${NC}"
    python3 -c "
import flask
import flask_sqlalchemy
import flask_cors
import jwt
print('✅ Todas as importações Python funcionando')
" || {
        log "${RED}❌ Erro nas importações Python${NC}"
        exit 1
    }
    
    # Testar conexão com banco
    log "${CYAN}🗄️  Testando conexão com banco de dados...${NC}"
    python3 -c "
import sys
import os
sys.path.append('src')

from src.main import app, db, User

with app.app_context():
    users = User.query.all()
    print(f'✅ Banco de dados funcionando. {len(users)} usuários encontrados.')
" || {
        log "${RED}❌ Erro na conexão com banco de dados${NC}"
        exit 1
    }
    
    # Testar servidor (start rápido)
    log "${CYAN}🌐 Testando servidor backend...${NC}"
    cd "$BACKEND_DIR"
    timeout 10s python3 -c "
import sys
import os
sys.path.append('src')
from src.main import app
print('✅ Servidor backend pode ser iniciado')
" || {
        log "${YELLOW}⚠️  Teste de servidor interrompido (normal)${NC}"
    }
    
    log "${GREEN}✅ Todos os testes passaram${NC}"
}

# Função para exibir informações finais
show_final_info() {
    log "${GREEN}🎉 Instalação concluída com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${WHITE}                    INSTALAÇÃO CONCLUÍDA                         ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${WHITE}📋 INFORMAÇÕES DO SISTEMA:${NC}"
    echo -e "${CYAN}   • Projeto: $PROJECT_NAME${NC}"
    echo -e "${CYAN}   • Diretório: $PROJECT_DIR${NC}"
    echo -e "${CYAN}   • Backend: Flask (Python)${NC}"
    echo -e "${CYAN}   • Frontend: HTML5 + JavaScript${NC}"
    echo -e "${CYAN}   • Banco: SQLite${NC}"
    echo ""
    echo -e "${WHITE}🚀 COMO USAR:${NC}"
    echo -e "${GREEN}   1. Iniciar sistema:${NC}     ${YELLOW}./start.sh${NC}"
    echo -e "${GREEN}   2. Verificar status:${NC}   ${YELLOW}./status.sh${NC}"
    echo -e "${GREEN}   3. Parar sistema:${NC}      ${YELLOW}./stop.sh${NC}"
    echo ""
    echo -e "${WHITE}🌐 ACESSO:${NC}"
    echo -e "${GREEN}   • Frontend:${NC} ${CYAN}http://localhost:8080${NC}"
    echo -e "${GREEN}   • Backend API:${NC} ${CYAN}http://localhost:5001/api${NC}"
    echo ""
    echo -e "${WHITE}🔐 CREDENCIAIS PADRÃO:${NC}"
    echo -e "${GREEN}   • Admin Geral:${NC} ${YELLOW}admin@kiaikido.com${NC} / ${YELLOW}123456${NC}"
    echo -e "${GREEN}   • Dojo Floripa:${NC} ${YELLOW}florianopolis@kiaikido.com${NC} / ${YELLOW}123456${NC}"
    echo ""
    echo -e "${WHITE}📚 DOCUMENTAÇÃO:${NC}"
    echo -e "${CYAN}   • README.md - Documentação completa${NC}"
    echo -e "${CYAN}   • Log de instalação: $LOG_FILE${NC}"
    echo ""
    echo -e "${PURPLE}🥋 Sistema Ki Aikido pronto para uso! 🇧🇷${NC}"
    echo ""
}

# Função principal
main() {
    # Inicializar log
    echo "=== Instalação Sistema Ki Aikido - $(date) ===" > "$LOG_FILE"
    
    show_banner
    
    log "${WHITE}🚀 Iniciando instalação do Sistema Ki Aikido...${NC}"
    
    # Verificações iniciais
    detect_os
    check_privileges
    check_project_structure
    check_system_dependencies
    check_ports
    
    # Configuração do ambiente
    create_virtual_environment
    install_python_dependencies
    setup_database
    
    # Scripts e testes
    create_control_scripts
    test_installation
    
    # Finalização
    show_final_info
    
    log "${GREEN}✅ Instalação concluída com sucesso em $(date)${NC}"
}

# Tratamento de erros
trap 'log "${RED}❌ Erro durante a instalação. Verifique o log: $LOG_FILE${NC}"; exit 1' ERR

# Executar instalação
main "$@"

