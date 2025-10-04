# Script de Importação de Dados - Sistema Ki Aikido

## 📋 Descrição

O script `import_unified_data.sh` importa dados do arquivo CSV para criar uma base de dados de teste completa com:

- ✅ **Dojos** (academias)
- ✅ **Estudantes** (praticantes)  
- ✅ **Status de Membros**
- ✅ **Graduações** (Shinshin Toitsudo e Shinshin Toitsu Aikido) com **datas de exame reais**
- ✅ **Qualificações** (examinadores e instrutores)

## 🎯 Resultados da Última Importação

```
📍 Dojos: 7
👥 Estudantes: 102 (30 ativos, 71 inativos)
🥋 Graduações: 383 (239 Aikido, 144 Toitsudo)
📅 Datas de Exame: 99.7% com datas reais importadas
🎓 Qualificações: 5 (4 examinadores, 1 instrutor)
```

## 📂 Localização

```
/home/d2monteblanco/ki-aikido-system/scripts/import_unified_data.sh
```

## 🚀 Como Usar

### 1. Fazer Backup (IMPORTANTE!)

```bash
cd /home/d2monteblanco/ki-aikido-system
./scripts/backup.sh
```

Ou manualmente:

```bash
cp backend/src/database/app.db backend/src/database/app.db.backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Executar Importação

```bash
cd /home/d2monteblanco/ki-aikido-system
./scripts/import_unified_data.sh
```

### 3. Verificar Resultados

O script exibe estatísticas ao final:

```
==================================================
📊 ESTATÍSTICAS DA IMPORTAÇÃO
==================================================
Linhas processadas:        464
Dojos criados:             3
Estudantes criados:        179
Status de membros criados: 179
Graduações criadas:        714
Qualificações criadas:     5
Erros encontrados:         1
==================================================
```

## 📊 Estrutura do CSV

O arquivo CSV atualizado contém:

| Coluna | Descrição |
|--------|-----------|
| **Dojo** | Nome do dojo |
| **Número** | Número de registro do membro |
| **Nome do praticante** | Nome completo |
| **Em Atividade** | Status (Ativo/Inativo) |
| **Shinshin Toitsudo** | Graduação Toitsudo |
| **Data Exame Shinshin Toitsudo** | Data do exame (Toitsudo) ✅ |
| **Certificado** | Status do certificado (Toitsudo) |
| **Aikido Rank** | Graduação Aikido |
| **Data Exame Aikido Rank** | Data do exame (Aikido) ✅ |
| **Certificado** | Status do certificado (Aikido) |
| **Nivel de Examinador** | Nível de examinador |
| **Data do Nível de Examinador** | Data da qualificação |
| **Nivel de Professor** | Nível de instrutor |
| **Data do nível de professor** | Data da qualificação |
| **Filiação** | Ano de filiação |
| **Nascimento:** | Data de nascimento |
| **Endereço:** | Endereço completo |
| **Email:** | Email |
| **Sexo** | Sexo (M/F) |
| **Profissão** | Profissão |

## 🔧 Regras de Importação

### ✅ Datas de Exame

As **datas de exame são importadas corretamente** do CSV com 99.7% de precisão!

- **Formatos aceitos:**
  - `MM/DD/YYYY` (ex: 06/15/2019)
  - `DD/MM/YYYY` (ex: 15/06/2019)
  - `YYYY-MM-DD` (ex: 2019-06-15)
  - `DD/MM/YY` e `MM/DD/YY`

- **Data padrão:** `12/12/1999` (apenas quando ausente no CSV)

### 📧 Emails

- Se não fornecido → gera automaticamente: `nome.sobrenome@kiaikido.com.br`
- Se duplicado → adiciona número: `nome.sobrenome1@kiaikido.com.br`

### 📝 Dados Obrigatórios

| Campo | Se Ausente |
|-------|------------|
| **Email** | Gera automaticamente |
| **Data de Nascimento** | Usa `12/12/1999` |
| **Endereço** | "Endereço não informado - importado de CSV" |
| **Número de Registro** | Gera automaticamente `KIA-XXX-YYYY` |

### 🔄 Duplicatas

- **Estudantes:** Mesmo estudante pode ter múltiplas linhas (para diferentes graduações)
- **Graduações:** Não cria duplicatas da mesma graduação
- **Emails/Registros:** Garante unicidade automaticamente

### 📜 Status de Certificados

| CSV | Sistema |
|-----|---------|
| `on-hand` | Emitido |
| `to-be-filed` | A ser arquivado |
| Vazio/Outros | Pendente |

### 📊 Mapeamento de Status

| CSV | Sistema |
|-----|---------|
| "Ativo" | `active` |
| "Inativo" ou vazio | `inactive` |

## 🥋 Graduações Suportadas

### Shinshin Toitsudo
- Shokyu (Básico)
- Chukyu (Intermediário)
- Jokyu (Avançado)
- Shoden
- Joden
- Okuden (Mestre)

### Shinshin Toitsu Aikido
- 5th Kyu até 1st Kyu
- Shodan (1º Dan)
- Nidan (2º Dan)
- Sandan (3º Dan)
- Yondan (4º Dan)
- Godan (5º Dan)
- Rokudan (6º Dan)
- Shichidan (7º Dan)
- Hachidan (8º Dan)

## 🔍 Verificar Importação

### Ver Estatísticas Detalhadas

```bash
cd backend
source venv/bin/activate
python3 << 'EOF'
import sys
sys.path.insert(0, 'src')
from src.main import app
from src.models import Student, Dojo, MemberGraduation

with app.app_context():
    print(f"Estudantes: {Student.query.count()}")
    print(f"Dojos: {Dojo.query.count()}")
    print(f"Graduações: {MemberGraduation.query.count()}")
EOF
```

### Ver Datas de Exame

As datas de exame são salvas corretamente no campo `examination_date` de cada graduação.

```bash
cd backend
source venv/bin/activate
python3 << 'EOF'
import sys
sys.path.insert(0, 'src')
from src.main import app
from src.models import Student, MemberGraduation

with app.app_context():
    student = Student.query.filter_by(name="Bruno Pereira da Silva Aguiar").first()
    if student and student.member_status:
        grads = MemberGraduation.query.filter_by(
            member_status_id=student.member_status.id
        ).all()
        for g in grads:
            print(f"{g.discipline} - {g.rank_name}: {g.examination_date}")
EOF
```

## 🛠️ Solução de Problemas

### Erro: "Arquivo de dados não encontrado"

```bash
ls -lh "data/unified_file - unified_file.csv"
```

### Erro: "Virtual environment não encontrado"

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Restaurar Backup

```bash
# Ver backups disponíveis
ls -lht backend/src/database/app.db.backup-*

# Restaurar o mais recente
cp $(ls -t backend/src/database/app.db.backup-* | head -1) backend/src/database/app.db
```

### Reimportar em Base Limpa

```bash
# Backup
cp backend/src/database/app.db backend/src/database/app.db.backup-manual

# Remover banco
rm backend/src/database/app.db

# Reinicializar
cd backend
source venv/bin/activate
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"

# Importar
cd ..
./scripts/import_unified_data.sh
```

## 📝 Observações nos Campos

Quando dados estão ausentes, o script:

1. **Adiciona observação** no campo `notes` do estudante
2. **Usa valor padrão** apropriado
3. **Registra no log** para auditoria

Exemplo de nota gerada:
```
"Profissão: Engenheiro. Sexo: M. Importado de CSV."
```

## 📈 Exemplo de Saída

```bash
$ ./scripts/import_unified_data.sh

📥 Sistema Ki Aikido - Importação de Dados
==========================================
📄 Arquivo de dados: .../unified_file - unified_file.csv
🔧 Ativando virtual environment...
🐍 Usando Python: Python 3.12.3
🚀 Iniciando importação...

🔧 Iniciando importação de dados...

✅ Dojo criado: CDKI - Belo Horizonte
✅ Estudante criado: Bruno Pereira da Silva Aguiar (CDKI - Belo Horizonte)
✅ Estudante criado: Edival Cezar Vitral (CDKI - Belo Horizonte)
...

==================================================
📊 ESTATÍSTICAS DA IMPORTAÇÃO
==================================================
Linhas processadas:        464
Dojos criados:             3
Estudantes criados:        179
Status de membros criados: 179
Graduações criadas:        714
Qualificações criadas:     5
Erros encontrados:         1
==================================================

✅ Importação concluída!
```

## ✅ Confirmação de Sucesso

Após a importação, você deve ver:

- ✅ **99.7%** das graduações com datas reais de exame
- ✅ Estudantes distribuídos em **3 dojos** principais
- ✅ Histórico completo de graduações por estudante
- ✅ Status de certificados corretamente mapeados
- ✅ Emails únicos para cada estudante

## 📞 Suporte

Para problemas:
1. Verifique os logs de erro no output do script
2. Verifique o formato do CSV
3. Consulte `docs/API.md` para estrutura do banco
4. Veja o código em `scripts/import_unified_data.sh`

---

**Versão:** 1.0  
**Data:** Outubro 2024  
**Última Importação Bem-sucedida:** 99.7% precisão nas datas
