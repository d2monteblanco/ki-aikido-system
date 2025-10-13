# Checklist de Deploy - Google Cloud VM

## ✅ Pré-Deploy (Máquina de Desenvolvimento)

### 1. Preparação do Código
- [ ] Todo código testado e funcionando localmente
- [ ] Todos os commits feitos no branch `main`
- [ ] Executar `git push origin main`
- [ ] Executar `./scripts/deploy/prepare_production.sh`
- [ ] Confirmar push para `origin/production`

### 2. Verificações de Segurança
- [ ] Remover credenciais hardcoded (se houver)
- [ ] Verificar se .gitignore está correto
- [ ] Revisar logs de debug que possam expor informações sensíveis

---

## ✅ Setup Inicial da VM (Apenas Primeira Vez)

### 1. Preparação da VM
- [ ] VM criada no Google Cloud Console
- [ ] Sistema operacional: Ubuntu 20.04 LTS ou superior
- [ ] Conexão SSH funcionando
- [ ] Firewall configurado (portas 80 e 443)
- [ ] Tags de rede aplicadas: `http-server`, `https-server`

### 2. Instalação de Dependências
```bash
ssh usuario@IP_DA_VM
```

- [ ] `sudo apt update && sudo apt upgrade -y`
- [ ] `sudo apt install -y python3 python3-pip python3-venv git nginx supervisor sqlite3`

### 3. Clone do Repositório
- [ ] Criar diretório: `sudo mkdir -p /opt/ki-aikido-system`
- [ ] Ajustar permissões: `sudo chown $USER:$USER /opt/ki-aikido-system`
- [ ] Clonar: `cd /opt && git clone -b production [URL] ki-aikido-system`
- [ ] Verificar branch: `cd ki-aikido-system && git branch`

### 4. Instalação da Aplicação
- [ ] Tornar scripts executáveis: `chmod +x scripts/deploy/*.sh`
- [ ] Executar instalação: `./scripts/deploy/install_vm.sh`
- [ ] Verificar se instalação completou sem erros

### 5. Segurança - CRITICAL
- [ ] **Gerar nova SECRET_KEY**:
  ```bash
  python3 -c "import secrets; print(secrets.token_hex(32))"
  ```
- [ ] Editar `/opt/ki-aikido-system/backend/src/main.py`
- [ ] Substituir `app.config['SECRET_KEY']` pela nova chave
- [ ] Salvar arquivo

### 6. Configuração do Nginx
- [ ] Copiar config: `sudo cp scripts/deploy/nginx.conf /etc/nginx/sites-available/ki-aikido`
- [ ] Criar link: `sudo ln -s /etc/nginx/sites-available/ki-aikido /etc/nginx/sites-enabled/`
- [ ] Remover default: `sudo rm -f /etc/nginx/sites-enabled/default`
- [ ] Se tiver domínio, editar `server_name` no arquivo nginx.conf
- [ ] Testar config: `sudo nginx -t`
- [ ] Reiniciar: `sudo systemctl restart nginx`
- [ ] Habilitar: `sudo systemctl enable nginx`

### 7. Configuração do Supervisor
- [ ] Copiar config: `sudo cp scripts/deploy/supervisor.conf /etc/supervisor/conf.d/ki-aikido.conf`
- [ ] Recarregar: `sudo supervisorctl reread`
- [ ] Atualizar: `sudo supervisorctl update`
- [ ] Iniciar: `sudo supervisorctl start ki-aikido`
- [ ] Verificar status: `sudo supervisorctl status ki-aikido`

### 8. Verificação Inicial
- [ ] Executar: `./scripts/deploy/check_health.sh`
- [ ] Todos os checks devem estar OK (✓)
- [ ] Testar API: `curl http://localhost:5000/api/health`
- [ ] Testar Nginx: `curl http://localhost`

### 9. Teste Externo
- [ ] Acessar via navegador: `http://IP_EXTERNO_DA_VM`
- [ ] Tela de login deve aparecer
- [ ] Fazer login: `admin@kiaikido.com` / `123456`
- [ ] Navegar pelo sistema
- [ ] Criar um cadastro de teste
- [ ] Fazer logout

### 10. Segurança Pós-Deploy
- [ ] **Alterar senha do admin**
- [ ] Criar usuários para cada dojo
- [ ] Testar permissões de acesso
- [ ] Configurar backup automático (cron)

### 11. SSL/HTTPS (Recomendado)
- [ ] Ter domínio apontando para IP da VM
- [ ] Instalar certbot: `sudo apt install -y certbot python3-certbot-nginx`
- [ ] Executar: `sudo certbot --nginx -d seu-dominio.com`
- [ ] Testar renovação: `sudo certbot renew --dry-run`
- [ ] Verificar HTTPS funcionando

---

## ✅ Deploy de Atualizações (Toda Vez)

### 1. Na Máquina de Desenvolvimento
- [ ] Código testado localmente
- [ ] Commits feitos no `main`
- [ ] Push: `git push origin main`
- [ ] Executar: `./scripts/deploy/prepare_production.sh`
- [ ] Confirmar push para production

### 2. Na VM (via SSH)
- [ ] Conectar: `ssh usuario@IP_DA_VM`
- [ ] Ir para diretório: `cd /opt/ki-aikido-system`
- [ ] Executar update: `./scripts/deploy/update_vm.sh`
- [ ] Aguardar conclusão (backup + pull + reinstall + restart)
- [ ] Verificar se não houve erros

### 3. Verificação Pós-Deploy
- [ ] Executar: `./scripts/deploy/check_health.sh`
- [ ] Todos os checks OK
- [ ] Testar sistema via navegador
- [ ] Verificar funcionalidades alteradas
- [ ] Monitorar logs: `tail -f logs/app.log`

### 4. Rollback (se necessário)
Se algo der errado:
- [ ] Parar app: `sudo supervisorctl stop ki-aikido`
- [ ] Voltar commit: `git reset --hard COMMIT_ANTERIOR`
- [ ] Restaurar backup: `./scripts/deploy/restore_db.sh backups/app_TIMESTAMP.db`
- [ ] Reiniciar: `sudo supervisorctl start ki-aikido`

---

## ✅ Manutenção Regular

### Diária
- [ ] Verificar logs de erro: `tail logs/error.log`
- [ ] Verificar espaço em disco: `df -h`

### Semanal
- [ ] Executar: `./scripts/deploy/check_health.sh`
- [ ] Verificar backups: `ls -lh backups/`
- [ ] Revisar logs do Nginx: `sudo tail -f /var/log/nginx/ki-aikido-error.log`

### Mensal
- [ ] Atualizar sistema: `sudo apt update && sudo apt upgrade`
- [ ] Limpar backups antigos (mantém últimos 30)
- [ ] Verificar certificado SSL (se configurado)
- [ ] Revisar usuários e permissões

---

## 📞 Contatos de Emergência

**Erros Críticos:**
1. Ver logs: `tail -f /opt/ki-aikido-system/logs/error.log`
2. Status supervisor: `sudo supervisorctl status ki-aikido`
3. Reiniciar: `sudo supervisorctl restart ki-aikido`

**Restauração de Backup:**
```bash
./scripts/deploy/restore_db.sh backups/app_TIMESTAMP.db
```

**Logs Importantes:**
- App: `/opt/ki-aikido-system/logs/app.log`
- Erro: `/opt/ki-aikido-system/logs/error.log`
- Nginx: `/var/log/nginx/ki-aikido-error.log`
- Supervisor: `/var/log/supervisor/supervisord.log`

---

## 📚 Documentação Adicional

- **Guia Rápido**: `DEPLOY_QUICKSTART.md`
- **Documentação Completa**: `docs/DEPLOY_GOOGLE_VM.md`
- **Scripts**: `scripts/deploy/README.md`
- **API**: `docs/API.md`
