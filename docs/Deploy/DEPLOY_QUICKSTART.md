# Guia Rápido de Deploy - Google Cloud VM

## Setup Inicial na VM (executar uma única vez)

### 1. Conectar à VM via SSH
```bash
ssh usuario@IP_DA_VM
```

### 2. Instalar dependências do sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git nginx supervisor sqlite3
```

### 3. Criar diretório e clonar repositório (branch production)
```bash
sudo mkdir -p /opt/ki-aikido-system
sudo chown $USER:$USER /opt/ki-aikido-system
cd /opt/ki-aikido-system
git clone -b production <URL_DO_SEU_REPOSITORIO> .
```

### 4. Executar instalação
```bash
chmod +x scripts/deploy/*.sh
./scripts/deploy/install_vm.sh
```

### 5. Configurar Nginx
```bash
sudo cp scripts/deploy/nginx.conf /etc/nginx/sites-available/ki-aikido
sudo ln -s /etc/nginx/sites-available/ki-aikido /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Configurar Supervisor
```bash
sudo cp scripts/deploy/supervisor.conf /etc/supervisor/conf.d/ki-aikido.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ki-aikido
```

### 7. Verificar instalação
```bash
./scripts/deploy/check_health.sh
```

### 8. Acessar sistema
Abra navegador e acesse: `http://IP_EXTERNO_DA_VM`

Login: `admin@kiaikido.com` | Senha: `123456`

---

## Atualizações (deploys subsequentes)

### Na máquina de desenvolvimento (local):
```bash
# 1. Desenvolver no branch main
git checkout main
# ... fazer alterações ...
git add .
git commit -m "Descrição das alterações"
git push origin main

# 2. Fazer merge para production
git checkout production
git merge main
git push origin production
```

### Na VM (via SSH):
```bash
cd /opt/ki-aikido-system
./scripts/deploy/update_vm.sh
```

**Pronto!** O sistema será atualizado automaticamente.

---

## Comandos Úteis

### Ver status da aplicação
```bash
sudo supervisorctl status ki-aikido
```

### Ver logs
```bash
tail -f /opt/ki-aikido-system/logs/app.log
tail -f /opt/ki-aikido-system/logs/error.log
```

### Reiniciar aplicação
```bash
sudo supervisorctl restart ki-aikido
```

### Parar aplicação
```bash
sudo supervisorctl stop ki-aikido
```

### Iniciar aplicação
```bash
sudo supervisorctl start ki-aikido
```

### Fazer backup manual
```bash
cd /opt/ki-aikido-system
./scripts/deploy/backup_db.sh
```

### Verificar saúde do sistema
```bash
cd /opt/ki-aikido-system
./scripts/deploy/check_health.sh
```

---

## Configuração de Firewall (Google Cloud)

No Console do Google Cloud:

1. VPC Network → Firewall → Create Firewall Rule
2. Nome: `allow-http-ki-aikido`
3. Targets: Specified target tags
4. Target tags: `http-server`
5. Source IP ranges: `0.0.0.0/0`
6. Protocols and ports: `tcp:80`
7. Criar regra

8. Adicionar tag `http-server` na sua instância VM

---

## Segurança - IMPORTANTE

### 1. Alterar SECRET_KEY
Na VM, edite `/opt/ki-aikido-system/backend/src/main.py`:
```python
# Gerar nova chave
python3 -c "import secrets; print(secrets.token_hex(32))"

# Substituir em main.py
app.config['SECRET_KEY'] = 'sua-chave-secreta-gerada-aqui'
```

Depois reinicie:
```bash
sudo supervisorctl restart ki-aikido
```

### 2. Alterar senha do admin
Acesse o sistema e mude a senha padrão em Configurações.

### 3. Configurar HTTPS (opcional mas recomendado)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## Troubleshooting

### Aplicação não inicia
```bash
sudo supervisorctl tail -f ki-aikido stderr
cat /opt/ki-aikido-system/logs/error.log
```

### Erro 502 Bad Gateway
```bash
# Verificar se backend está rodando
curl http://localhost:5000/api/health
sudo supervisorctl status ki-aikido

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Banco corrompido
```bash
cd /opt/ki-aikido-system
ls -lh backups/
./scripts/deploy/restore_db.sh backups/app_YYYYMMDD_HHMMSS.db
```

---

## Documentação Completa

Ver arquivo completo: `docs/DEPLOY_GOOGLE_VM.md`
