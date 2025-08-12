#!/bin/bash

# Script de Instalação Rápida do Sistema Ki Aikido
# Para usar: curl -sSL https://raw.githubusercontent.com/SEU_USUARIO/ki-aikido-system/main/scripts/quick-install.sh | bash

set -e

echo "🥋 Instalação Rápida - Sistema Ki Aikido"
echo "========================================"

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo "📦 Instalando Git..."
    sudo apt update
    sudo apt install -y git
fi

# Clonar repositório
INSTALL_DIR="$HOME/ki-aikido-system"
if [ -d "$INSTALL_DIR" ]; then
    echo "📁 Diretório já existe. Atualizando..."
    cd "$INSTALL_DIR"
    git pull
else
    echo "📥 Clonando repositório..."
    git clone https://github.com/SEU_USUARIO/ki-aikido-system.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Executar instalação completa
echo "🚀 Executando instalação..."
./scripts/install.sh

echo ""
echo "✅ Instalação rápida concluída!"
echo "🚀 Execute './start.sh' para iniciar o sistema."

