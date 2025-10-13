# Deploy do Sistema Ki Aikido em Google Cloud VM

## Visão Geral

Este documento descreve o processo completo de deploy do Sistema Ki Aikido em uma Google Cloud VM usando o branch `production`.

**Ambiente de Desenvolvimento**: Branch `main`  
**Ambiente de Produção**: Branch `production` (na Google VM)

## Pré-requisitos na Google VM

- Ubuntu 20.04 LTS ou superior
- Python 3.8+
- Git
- Nginx (para servir o frontend e fazer proxy reverso)
- Supervisord (para gerenciar processos)
- Conexão SSH configurada

## Arquitetura de Deploy

```
Internet → Nginx (porta 80/443)
              ↓
         Frontend (arquivos estáticos)
              ↓
         Backend Flask (porta 5000)
              ↓
         SQLite Database
```

## Estrutura de Diretórios na VM

```
/opt/ki-aikido-system/          # Aplicação
├── backend/
├── frontend/
├── scripts/
└── logs/                        # Logs do sistema

/etc/nginx/sites-available/      # Configuração Nginx
/etc/supervisor/conf.d/           # Configuração Supervisor
```

## Passos de Deploy

### 1. Preparação Inicial da VM

Execute na VM via SSH:

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências do sistema
sudo apt install -y python3 python3-pip python3-venv git nginx supervisor sqlite3

# Criar diretório da aplicação
sudo mkdir -p /opt/ki-aikido-system
sudo chown $USER:$USER /opt/ki-aikido-system

# Criar diretório de logs
sudo mkdir -p /opt/ki-aikido-system/logs
```

### 2. Clone do Repositório

```bash
# Ir para o diretório da aplicação
cd /opt/ki-aikido-system

# Clonar repositório (branch production)
git clone -b production <URL_DO_REPOSITORIO> .

# OU se já existe, fazer checkout do branch production
git fetch origin
git checkout production
git pull origin production
```

### 3. Configuração do Backend

```bash
cd /opt/ki-aikido-system

# Executar script de instalação
chmod +x scripts/deploy/install_vm.sh
./scripts/deploy/install_vm.sh
```

### 4. Configuração do Nginx

```bash
# Copiar configuração do Nginx
sudo cp /opt/ki-aikido-system/scripts/deploy/nginx.conf /etc/nginx/sites-available/ki-aikido

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/ki-aikido /etc/nginx/sites-enabled/

# Remover configuração default se necessário
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Configuração do Supervisor

```bash
# Copiar configuração do Supervisor
sudo cp /opt/ki-aikido-system/scripts/deploy/supervisor.conf /etc/supervisor/conf.d/ki-aikido.conf

# Recarregar configuração
sudo supervisorctl reread
sudo supervisorctl update

# Iniciar aplicação
sudo supervisorctl start ki-aikido
```

### 6. Configuração de Firewall (Google Cloud)

No Console do Google Cloud:

1. Vá para VPC Network → Firewall
2. Crie regra para HTTP (porta 80):
   - Nome: `allow-http-ki-aikido`
   - Targets: Tags de destino
   - Tags de destino: `http-server`
   - Filtros de origem: `0.0.0.0/0`
   - Protocolos e portas: `tcp:80`

3. Crie regra para HTTPS (porta 443) se configurar SSL:
   - Nome: `allow-https-ki-aikido`
   - Targets: Tags de destino
   - Tags de destino: `https-server`
   - Filtros de origem: `0.0.0.0/0`
   - Protocolos e portas: `tcp:443`

4. Adicione as tags na sua instância VM

## Atualizações e Manutenção

### Atualizar o Sistema (Deploy de Nova Versão)

```bash
# Na VM, conectar via SSH
cd /opt/ki-aikido-system

# Executar script de atualização
./scripts/deploy/update_vm.sh
```

### Comandos de Manutenção

```bash
# Ver status da aplicação
sudo supervisorctl status ki-aikido

# Parar aplicação
sudo supervisorctl stop ki-aikido

# Iniciar aplicação
sudo supervisorctl start ki-aikido

# Reiniciar aplicação
sudo supervisorctl restart ki-aikido

# Ver logs da aplicação
tail -f /opt/ki-aikido-system/logs/app.log
tail -f /opt/ki-aikido-system/logs/error.log

# Ver logs do Supervisor
sudo tail -f /var/log/supervisor/supervisord.log

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup do Banco de Dados

```bash
# Criar backup
./scripts/deploy/backup_db.sh

# Os backups são salvos em:
# /opt/ki-aikido-system/backups/
```

### Restaurar Banco de Dados

```bash
# Parar aplicação
sudo supervisorctl stop ki-aikido

# Restaurar backup
./scripts/deploy/restore_db.sh /opt/ki-aikido-system/backups/app_YYYYMMDD_HHMMSS.db

# Iniciar aplicação
sudo supervisorctl start ki-aikido
```

## Verificação de Deploy

Após o deploy, verifique:

1. **API está respondendo**:
```bash
curl http://localhost/api/health
# Deve retornar: {"status":"OK","message":"API is running"}
```

2. **Frontend está acessível**:
```bash
curl -I http://localhost
# Deve retornar: HTTP/1.1 200 OK
```

3. **Supervisor está rodando**:
```bash
sudo supervisorctl status
# Deve mostrar: ki-aikido RUNNING
```

4. **Acesse via navegador**:
```
http://<IP_EXTERNO_DA_VM>
```

## Segurança

### Alterar SECRET_KEY em Produção

Antes do primeiro deploy, edite `/opt/ki-aikido-system/backend/src/main.py`:

```python
# Gerar nova chave secreta
import secrets
secrets.token_hex(32)

# Usar a chave gerada
app.config['SECRET_KEY'] = 'sua-chave-secreta-gerada'
```

### Configurar HTTPS (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substituir pelo seu domínio)
sudo certbot --nginx -d seu-dominio.com

# Certbot configurará automaticamente o Nginx
```

### Alterar Senha do Admin

Após primeiro deploy, acesse o sistema e altere a senha padrão:

1. Login: `admin@kiaikido.com`
2. Senha padrão: `123456`
3. Vá em Configurações → Alterar Senha

## Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
sudo supervisorctl tail -f ki-aikido stderr
cat /opt/ki-aikido-system/logs/error.log

# Verificar se virtual env está correto
source /opt/ki-aikido-system/backend/venv/bin/activate
python3 -c "import flask; print(flask.__version__)"
```

### Erro 502 Bad Gateway

```bash
# Verificar se backend está rodando
sudo supervisorctl status ki-aikido
curl http://localhost:5000/api/health

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Erro de permissão no banco de dados

```bash
# Ajustar permissões
sudo chown -R $USER:$USER /opt/ki-aikido-system/backend/src/database/
chmod 644 /opt/ki-aikido-system/backend/src/database/app.db
```

### Aplicação lenta ou travando

```bash
# Verificar recursos da VM
free -h
df -h
top

# Considere aumentar recursos da VM se necessário
```

## Monitoramento

### Logs Importantes

- **Aplicação**: `/opt/ki-aikido-system/logs/app.log`
- **Erros**: `/opt/ki-aikido-system/logs/error.log`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **Supervisor**: `/var/log/supervisor/supervisord.log`

### Monitoramento de Recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Processos Python
ps aux | grep python
```

## Workflow de Desenvolvimento → Produção

1. **Desenvolvimento local** (branch `main`):
   - Desenvolva e teste localmente
   - Commit e push para `origin/main`

2. **Merge para production**:
   ```bash
   git checkout production
   git merge main
   git push origin production
   ```

3. **Deploy na VM**:
   ```bash
   # Na VM via SSH
   cd /opt/ki-aikido-system
   ./scripts/deploy/update_vm.sh
   ```

## Contatos e Suporte

- Repositório: [URL do seu repositório]
- Documentação: `/opt/ki-aikido-system/docs/`
- Logs: `/opt/ki-aikido-system/logs/`
