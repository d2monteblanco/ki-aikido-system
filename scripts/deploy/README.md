# Scripts de Deploy - Sistema Ki Aikido

Este diretório contém os scripts necessários para deploy e manutenção do Sistema Ki Aikido em Google Cloud VM.

## Scripts Disponíveis

### `install_vm.sh`
**Uso**: Instalação inicial do sistema na VM  
**Quando usar**: Primeira vez que configura a VM

```bash
./scripts/deploy/install_vm.sh
```

**O que faz**:
- Cria ambiente virtual Python
- Instala dependências
- Inicializa banco de dados
- Cria estrutura de diretórios

---

### `update_vm.sh`
**Uso**: Atualização do sistema (deploy de nova versão)  
**Quando usar**: Sempre que fizer push de novas alterações para o branch production

```bash
./scripts/deploy/update_vm.sh
```

**O que faz**:
- Faz backup automático do banco
- Para a aplicação
- Atualiza código do git (branch production)
- Atualiza dependências Python
- Reinicia aplicação
- Verifica se está funcionando

---

### `backup_db.sh`
**Uso**: Backup manual do banco de dados  
**Quando usar**: Antes de alterações críticas ou manutenção

```bash
./scripts/deploy/backup_db.sh
```

**O que faz**:
- Cria backup do SQLite com timestamp
- Mantém últimos 30 backups
- Usa `.backup` do sqlite3 para consistência

**Backups salvos em**: `/opt/ki-aikido-system/backups/`

---

### `restore_db.sh`
**Uso**: Restaurar banco de dados de um backup  
**Quando usar**: Recuperação de dados ou rollback

```bash
./scripts/deploy/restore_db.sh /opt/ki-aikido-system/backups/app_20240101_120000.db
```

**O que faz**:
- Cria backup de segurança antes de restaurar
- Restaura backup especificado
- Verifica integridade do banco
- Reverte se houver erro

---

### `check_health.sh`
**Uso**: Verificação de saúde do sistema  
**Quando usar**: Diagnosticar problemas ou verificar status

```bash
./scripts/deploy/check_health.sh
```

**O que verifica**:
- Status do Supervisor
- Status do Nginx
- API respondendo
- Frontend acessível
- Integridade do banco
- Espaço em disco
- Uso de memória
- Logs recentes

---

### `prepare_production.sh`
**Uso**: Preparar código para produção  
**Quando usar**: Antes de fazer merge de main para production

```bash
./scripts/deploy/prepare_production.sh
```

**O que faz**:
- Verifica branch atual
- Faz merge de main para production
- Valida código Python
- Exibe alterações
- Faz push para origin/production

---

## Arquivos de Configuração

### `nginx.conf`
Configuração do Nginx para:
- Servir frontend (arquivos estáticos)
- Proxy reverso para API (porta 5000)
- Cache de arquivos estáticos
- Upload de documentos
- Segurança básica

**Instalação**:
```bash
sudo cp scripts/deploy/nginx.conf /etc/nginx/sites-available/ki-aikido
sudo ln -s /etc/nginx/sites-available/ki-aikido /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

### `supervisor.conf`
Configuração do Supervisor para:
- Gerenciar processo Flask
- Auto-restart em caso de falha
- Logging automático
- Variáveis de ambiente

**Instalação**:
```bash
sudo cp scripts/deploy/supervisor.conf /etc/supervisor/conf.d/ki-aikido.conf
sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl start ki-aikido
```

---

## Workflow de Deploy

### 1. Desenvolvimento Local (branch main)
```bash
git checkout main
# fazer alterações
git add .
git commit -m "Descrição"
git push origin main
```

### 2. Preparar para Production
```bash
./scripts/deploy/prepare_production.sh
```

### 3. Deploy na VM
```bash
ssh usuario@IP_DA_VM
cd /opt/ki-aikido-system
./scripts/deploy/update_vm.sh
```

### 4. Verificar
```bash
./scripts/deploy/check_health.sh
```

---

## Estrutura de Logs

- **App**: `/opt/ki-aikido-system/logs/app.log`
- **Errors**: `/opt/ki-aikido-system/logs/error.log`
- **Nginx Access**: `/var/log/nginx/ki-aikido-access.log`
- **Nginx Error**: `/var/log/nginx/ki-aikido-error.log`
- **Supervisor**: `/var/log/supervisor/supervisord.log`

---

## Comandos Úteis

```bash
# Ver logs em tempo real
tail -f /opt/ki-aikido-system/logs/app.log

# Status da aplicação
sudo supervisorctl status ki-aikido

# Reiniciar aplicação
sudo supervisorctl restart ki-aikido

# Verificar processos Python
ps aux | grep python

# Testar API
curl http://localhost:5000/api/health

# Listar backups
ls -lh /opt/ki-aikido-system/backups/
```

---

## Requisitos

- Ubuntu 20.04+ ou Debian 10+
- Python 3.8+
- Git
- Nginx
- Supervisor
- SQLite 3
- Sudo access

---

## Troubleshooting

Ver documentação completa em: `docs/DEPLOY_GOOGLE_VM.md`

Ou guia rápido em: `DEPLOY_QUICKSTART.md`
