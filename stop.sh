#!/bin/bash
# Script para parar o Sistema Ki Aikido

echo "🛑 Parando Sistema Ki Aikido..."

# Verificar se há processos rodando
RUNNING_PROCS=$(pgrep -f "python.*main.py")
if [ -z "$RUNNING_PROCS" ]; then
    echo "ℹ️  Nenhum processo do Ki Aikido encontrado rodando."
else
    echo "🔄 Encontrados processos: $RUNNING_PROCS"
fi

# Parar processos Python do Ki Aikido (graceful)
PIDS=$(ps aux | grep "python3 src/main.py" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo "🔄 Enviando sinal TERM para processos Python..."
    echo $PIDS | xargs kill -TERM 2>/dev/null || true
    sleep 3
    
    # Verificar se ainda estão rodando
    PIDS=$(ps aux | grep "python3 src/main.py" | grep -v grep | awk '{print $2}')
    if [ ! -z "$PIDS" ]; then
        echo "🔨 Forçando parada dos processos (KILL)..."
        echo $PIDS | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Limpar qualquer processo travado
STOPPED_PROCS=$(ps aux | grep python | grep -E '\sT\s' | grep main.py)
if [ ! -z "$STOPPED_PROCS" ]; then
    echo "🔧 Limpando processos travados..."
    pkill -f "python.*main.py" 2>/dev/null
fi

# Parar qualquer processo na porta 5000
PIDS=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS" ]; then
    echo "🔄 Liberando porta 5000 (PIDs: $PIDS)..."
    echo $PIDS | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Verificação final
if pgrep -f "python.*main.py" > /dev/null; then
    echo "⚠️  Alguns processos ainda podem estar rodando"
    echo "🔍 Execute './status.sh' para verificar"
else
    echo "✅ Todos os processos do Ki Aikido foram finalizados"
fi

# Verificar se a porta está livre
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "⚠️  Porta 5000 ainda ocupada por outro processo"
else
    echo "✅ Porta 5000 liberada"
fi

echo "🏁 Sistema parado com sucesso."

