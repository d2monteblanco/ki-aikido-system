#!/bin/bash

# Script de Configuração para Desenvolvimento
# Para desenvolvedores que querem contribuir com o projeto

set -e

echo "🛠️  Configurando Ambiente de Desenvolvimento"
echo "============================================"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

# Instalar dependências de desenvolvimento
echo "📦 Instalando dependências de desenvolvimento..."
cd "$BACKEND_DIR"
source venv/bin/activate

# Instalar ferramentas de desenvolvimento
pip install \
    black \
    flake8 \
    pytest \
    pytest-cov \
    pre-commit

# Configurar pre-commit hooks
echo "🔧 Configurando pre-commit hooks..."
cat > "$PROJECT_DIR/.pre-commit-config.yaml" << EOF
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203]
EOF

pre-commit install

# Criar estrutura de testes
echo "🧪 Criando estrutura de testes..."
mkdir -p "$BACKEND_DIR/tests"

cat > "$BACKEND_DIR/tests/__init__.py" << EOF
# Testes do Sistema Ki Aikido
EOF

cat > "$BACKEND_DIR/tests/test_models.py" << EOF
import pytest
from src.models import User, Dojo, Student
from src.main import app, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_user_creation(client):
    """Teste de criação de usuário"""
    user = User(
        name="Teste User",
        email="teste@example.com",
        role="admin"
    )
    user.set_password("123456")
    
    db.session.add(user)
    db.session.commit()
    
    assert user.id is not None
    assert user.check_password("123456")
    assert not user.check_password("wrong")

def test_dojo_creation(client):
    """Teste de criação de dojo"""
    dojo = Dojo(
        name="Dojo Teste",
        address="Endereço Teste",
        contact_email="dojo@teste.com"
    )
    
    db.session.add(dojo)
    db.session.commit()
    
    assert dojo.id is not None
    assert dojo.name == "Dojo Teste"
EOF

cat > "$BACKEND_DIR/tests/test_api.py" << EOF
import json
import pytest
from src.main import app, db
from src.models import User, Dojo

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            
            # Criar usuário de teste
            user = User(
                name="Admin Teste",
                email="admin@teste.com",
                role="admin"
            )
            user.set_password("123456")
            db.session.add(user)
            
            # Criar dojo de teste
            dojo = Dojo(
                name="Dojo Teste",
                address="Endereço Teste",
                contact_email="dojo@teste.com"
            )
            db.session.add(dojo)
            db.session.commit()
            
            yield client
            db.drop_all()

def test_health_check(client):
    """Teste do endpoint de health check"""
    response = client.get('/api/health')
    assert response.status_code == 200
    
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_login(client):
    """Teste de login"""
    response = client.post('/api/auth/login', 
        data=json.dumps({
            'email': 'admin@teste.com',
            'password': '123456'
        }),
        content_type='application/json'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'user' in data
    assert data['user']['email'] == 'admin@teste.com'
EOF

# Criar configuração do pytest
cat > "$BACKEND_DIR/pytest.ini" << EOF
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
EOF

# Criar Makefile para comandos comuns
cat > "$PROJECT_DIR/Makefile" << EOF
.PHONY: install test lint format run clean

# Instalar dependências
install:
	./scripts/install.sh

# Executar testes
test:
	cd backend && source venv/bin/activate && pytest

# Verificar código com linter
lint:
	cd backend && source venv/bin/activate && flake8 src/

# Formatar código
format:
	cd backend && source venv/bin/activate && black src/

# Executar aplicação
run:
	./start.sh

# Limpar arquivos temporários
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

# Executar todos os checks
check: lint test

# Preparar para commit
prepare: format lint test
EOF

echo "✅ Ambiente de desenvolvimento configurado!"
echo ""
echo "🧪 Comandos disponíveis:"
echo "  make test      - Executar testes"
echo "  make lint      - Verificar código"
echo "  make format    - Formatar código"
echo "  make run       - Executar aplicação"
echo "  make check     - Lint + Testes"
echo "  make prepare   - Preparar para commit"
echo ""
echo "🔧 Pre-commit hooks instalados para garantir qualidade do código."

