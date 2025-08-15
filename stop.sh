#!/bin/bash
# Script para parar o Sistema Ki Aikido

echo "🛑 Parando Sistema Ki Aikido..."

# Parar processos Python do Ki Aikido (graceful)
PIDS_BACKEND=$(ps aux | grep "python src/main.py" | grep -v grep | awk \'{print $2}\')
if [ ! -z "$PIDS_BACKEND" ]; then
    echo "🔄 Enviando sinal TERM para processos Python do backend..."
    echo $PIDS_BACKEND | xargs kill -TERM 2>/dev/null || true
    sleep 3
    
    # Verificar se ainda estão rodando
    PIDS_BACKEND=$(ps aux | grep "python src/main.py" | grep -v grep | awk \'{print $2}\')
    if [ ! -z "$PIDS_BACKEND" ]; then
        echo "🔨 Forçando parada dos processos do backend (KILL)..."
        echo $PIDS_BACKEND | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Parar processos do servidor HTTP do frontend
PIDS_FRONTEND=$(ps aux | grep "python3 -m http.server 8080 --directory frontend" | grep -v grep | awk \'{print $2}\')
if [ ! -z "$PIDS_FRONTEND" ]; then
    echo "🔄 Enviando sinal TERM para processos do frontend..."
    echo $PIDS_FRONTEND | xargs kill -TERM 2>/dev/null || true
    sleep 3
    
    # Verificar se ainda estão rodando
    PIDS_FRONTEND=$(ps aux | grep "python3 -m http.server 8080 --directory frontend" | grep -v grep | awk \'{print $2}\')
    if [ ! -z "$PIDS_FRONTEND" ]; then
        echo "🔨 Forçando parada dos processos do frontend (KILL)..."
        echo $PIDS_FRONTEND | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Limpar qualquer processo travado
STOPPED_PROCS=$(ps aux | grep python | grep -E '\sT\s' | grep -E "(main.py|http.server)")
if [ ! -z "$STOPPED_PROCS" ]; then
    echo "🔧 Limpando processos travados..."
    pkill -f "python.*(main.py|http.server)" 2>/dev/null
fi

# Parar qualquer processo na porta 5000
PIDS_5000=$(lsof -ti:5000 2>/dev/null)
if [ ! -z "$PIDS_5000" ]; then
    echo "🔄 Liberando porta 5000 (PIDs: $PIDS_5000)..."
    echo $PIDS_5000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Parar qualquer processo na porta 8080
PIDS_8080=$(lsof -ti:8080 2>/dev/null)
if [ ! -z "$PIDS_8080" ]; then
    echo "🔄 Liberando porta 8080 (PIDs: $PIDS_8080)..."
    echo $PIDS_8080 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Verificação final
if pgrep -f "python.*(main.py|http.server)" > /dev/null; then
    echo "⚠️  Alguns processos ainda podem estar rodando"
    echo "🔍 Execute './status.sh' para verificar"
else
    echo "✅ Todos os processos do Ki Aikido foram finalizados"
fi

# Verificar se as portas estão livres
if lsof -ti:5000 >/dev/null 2>&1; then
    echo "⚠️  Porta 5000 ainda ocupada por outro processo"
else
    echo "✅ Porta 5000 liberada"
fi

if lsof -ti:8080 >/dev/null 2>&1; then
    echo "⚠️  Porta 8080 ainda ocupada por outro processo"
else
    echo "✅ Porta 8080 liberada"
fi

echo "🏁 Sistema parado com sucesso."


