# Projeto: Sistema de Gestão de Processos e Pagamentos - Ki Society Japão

## 1. VISÃO GERAL

### 1.1 Objetivo
Criar um módulo integrado ao sistema Ki Aikido Brasil para gerenciar todos os processos, documentações e pagamentos relacionados aos requerimentos da **Ki Society Headquarters (Japão)** para dojos e professores brasileiros, com controle de histórico completo, status e pendências.

### 1.2 Contexto
Baseado na análise da documentação em `/drive`, identificamos os seguintes processos críticos que precisam ser gerenciados:

**Processos principais:**
1. **Registro e renovação de examinadores** (Qualified Examiner)
2. **Aplicação para Lecturer** (Instrutor/Professor Certificado)
3. **Aplicação para graduações Dan** (4º Dan+, Ki Aikido e Ki Development)
4. **Relatórios anuais de membros** (Membership Reports)
5. **Pagamentos e taxas** ao Japão
6. **Documentação de suporte** (cartas de recomendação, pledges, certificados)

### 1.3 Documentação de Referência Analisada

#### Documentos principais (em `/drive/Documentação de referência - Japão/`)
- `Revised RULES & REGULATIONS 2025.pdf` - **Regulamento oficial (documento principal)**
- `APPLICATION FOR KI AIKIDO GRADES.pdf` - Formulário graduação Aikido
- `APPLICATION FOR KI DEVELOPMENT GRADES.pdf` - Formulário graduação Ki Development
- `Application form for Lecturer.pdf` - Formulário de candidatura a Lecturer
- `Qualified Examiner registration form.docx` - Registro de examinador
- `Qualified Examiner Registration Form Renewal.pdf` - Renovação de examinador
- `PLEDGE.pdf` - Termo de compromisso
- `YondanandaboveRecommendationForm2023.docx` - Recomendação 4º Dan+
- `Example Recommendation Letter.doc` - Exemplo carta recomendação
- `Membership_Reports_Template.xls` - Template relatório membros
- `annual report.xlsx` - Relatório anual

#### Exemplos arquivados
- **Forms Archive - Dan/**: Exemplos de formulários de graduação Dan
- **Forms Archive - Lecturer/**: Exemplos de processos de professores (Pledge, Registration, Renewal, Recommendation Letters)

---

## 2. ANÁLISE DOS REQUISITOS JAPONESES

### 2.1 Tipos de Processos Identificados

#### A) REGISTRO/RENOVAÇÃO DE EXAMINADORES (Qualified Examiner)
**Documentos necessários:**
- Qualified Examiner Registration Form
- Recommendation Letter (carta do Chief Instructor)
- Pledge Form (termo de compromisso)
- Comprovante de graduação atual (Aikido e Toitsudo)

**Informações requeridas:**
- Nome, data nascimento, sexo
- Ki Society/Federation de origem
- Endereço completo, telefone
- Rank atual Shinshin Toitsudo (com data de obtenção)
- Rank atual Shinshin Toitsu Aikido (com data de obtenção)
- Nome do Chief Instructor
- Assinaturas (Chief Instructor e candidato)

**Periodicidade:** Renovação anual ou bienal (verificar no regulamento 2025)

#### B) APLICAÇÃO PARA GRADUAÇÕES AVANÇADAS DE DAN (4º Dan+)
**Documentos necessários:**
- Dan Recommendation Form
- Recommendation Letter do Chief Instructor
- Comprovante de graduação atual
- Histórico de treinamento

**Informações requeridas:**
- Dados pessoais completos
- Graduação atual (Aikido e Toitsudo) com datas
- Dan sendo solicitado
- Afiliação (Ki Society/Federation)
- Data do exame
- Assinatura do Chief Instructor

#### C) APLICAÇÃO PARA LECTURER (Instrutor/Professor Certificado)
**Documentos necessários:**
- Application form for Lecturer (formulário oficial)
- Recommendation Letter (carta do Chief Instructor)
- Pledge Form (termo de compromisso)
- Comprovante de graduação atual (Aikido e Toitsudo)
- Certificados de graduações anteriores
- Histórico de treinamento e ensino

**Informações requeridas:**
- Nome completo, data de nascimento, sexo
- Ki Society/Federation de origem
- Endereço completo, telefone, email
- Rank atual Shinshin Toitsudo (com data de obtenção)
- Rank atual Shinshin Toitsu Aikido (com data de obtenção)
- Experiência de ensino (anos, locais)
- Formação acadêmica (opcional)
- Nome do Chief Instructor
- Assinaturas (Chief Instructor e candidato)

**Pré-requisitos identificados:**
- Graduação mínima em Aikido (geralmente 1º Dan ou superior)
- Graduação mínima em Toitsudo
- Aprovação do Chief Instructor regional
- Comprometimento com os princípios da Ki Society

**Periodicidade:** Processo único por candidato (não requer renovação periódica, mas pode requerer atualizações)

**Observações:**
- Diferente de "Qualified Examiner" (examinador), o Lecturer é a qualificação para atuar como instrutor/professor
- Processo similar ao Qualified Examiner mas com foco em capacidade de ensino
- Baseado nos exemplos em Forms Archive - Lecturer/, o processo inclui os mesmos documentos (Pledge, Registration, Recommendation)

#### D) RELATÓRIOS DE MEMBROS (Membership Reports)
**Documentos necessários:**
- Membership Reports Template preenchido
- Annual Report

**Informações requeridas:**
- Lista de todos os membros do dojo
- Status de cada membro (ativo/inativo)
- Graduações atuais
- Novos membros no período
- Estatísticas do dojo

**Periodicidade:** Anual

#### D) PAGAMENTOS E TAXAS
**Tipos de pagamentos identificados (baseado em análise dos formulários):**
1. Taxa de registro de examinador
2. Taxa de renovação de examinador
3. Taxa de aplicação para Dan
4. Taxa anual de filiação do dojo
5. Outras taxas administrativas

#### E) ANUIDADES DE ALUNOS (Membership Fees)
**Documentos necessários:**
- Comprovante de pagamento da anuidade
- Registro de status de pagamento anual

**Informações requeridas:**
- Aluno (member_status_id)
- Ano de referência
- Valor pago
- Data de pagamento
- Método de pagamento
- Status (pending, paid, overdue, exempt)
- Comprovante digitalizado

**Periodicidade:** Anual por aluno

**Observações:**
- Alunos com anuidade em dia têm status "active"
- Alunos com atraso superior a 30 dias ficam "inactive"
- Histórico de pagamentos mantido para auditoria

#### F) GESTÃO DE DOCUMENTOS DE EXAMES (Kyu e Dan 1-3)
**Documentos necessários por tipo de exame:**

**Para Kyu (exames locais):**
- Formulário de aplicação para exame
- Lista de presença do exame
- Resultado do exame (aprovado/reprovado)
- Fotos do exame (opcional)
- Certificado emitido

**Para Dan 1º ao 3º Dan:**
- APPLICATION FOR KI AIKIDO GRADES.pdf preenchido
- APPLICATION FOR KI DEVELOPMENT GRADES.pdf preenchido
- Carta de recomendação do instrutor
- Comprovante de pagamento da taxa de exame
- Fotos do exame
- Certificado após aprovação

**Informações requeridas:**
- Aluno (member_status_id)
- Tipo de exame (kyu ou dan)
- Graduação sendo testada (1kyu, 1dan, 2dan, 3dan, etc)
- Data do exame
- Local do exame (dojo_id)
- Examinador responsável
- Resultado (approved, failed, pending)
- Documentos anexados (PDFs, fotos)
- Observações do examinador

**Fluxo de gestão:**
1. Criação do registro de exame (agendamento)
2. Upload de documentos pré-exame (formulários)
3. Realização do exame
4. Upload de documentos pós-exame (resultados, fotos)
5. Aprovação/reprovação
6. Emissão de certificado (se aprovado)
7. Arquivamento permanente

**Referência de arquivos:**
- `/drive/Forms Archive - Dan/` - Exemplos de formulários Dan
- `/drive/Documentação de referência - Japão/APPLICATION FOR KI AIKIDO GRADES.pdf`
- `/drive/Documentação de referência - Japão/APPLICATION FOR KI DEVELOPMENT GRADES.pdf`

---

## 3. ESTRUTURA DE DADOS PROPOSTA

### 3.1 Novas Tabelas do Banco de Dados

#### Tabela: `japan_process`
Gerencia todos os processos com o Japão por dojo.

```sql
CREATE TABLE japan_process (
    id INTEGER PRIMARY KEY,
    dojo_id INTEGER NOT NULL,  -- FK para dojo
    process_type VARCHAR(100) NOT NULL,  -- 'examiner_registration', 'examiner_renewal', 'lecturer_application', 'dan_application', 'membership_report'
    process_subtype VARCHAR(100),  -- Ex: '4dan', '5dan', 'assistant_examiner', etc
    member_status_id INTEGER,  -- FK para member_status (se aplicável - para graduações/examinadores específicos)
    
    -- Status e datas
    status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- 'draft', 'pending_documents', 'pending_payment', 'submitted', 'approved', 'rejected', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    approved_at DATETIME,
    completed_at DATETIME,
    
    -- Informações adicionais
    year_reference INTEGER,  -- Ano de referência (para relatórios anuais)
    deadline_date DATE,  -- Data limite para submissão
    notes TEXT,  -- Observações gerais
    rejection_reason TEXT,  -- Motivo de rejeição (se aplicável)
    
    -- Controle
    created_by_user_id INTEGER NOT NULL,  -- FK para user
    updated_by_user_id INTEGER,  -- FK para user
    updated_at DATETIME,
    
    FOREIGN KEY (dojo_id) REFERENCES dojo(id),
    FOREIGN KEY (member_status_id) REFERENCES member_status(id),
    FOREIGN KEY (created_by_user_id) REFERENCES user(id),
    FOREIGN KEY (updated_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `japan_process_document`
Vincula documentos aos processos.

```sql
CREATE TABLE japan_process_document (
    id INTEGER PRIMARY KEY,
    japan_process_id INTEGER NOT NULL,  -- FK para japan_process
    document_type VARCHAR(100) NOT NULL,  -- 'application_form', 'recommendation_letter', 'pledge', 'certificate', 'payment_proof', 'other'
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),  -- MIME type
    file_size INTEGER,
    
    -- Status do documento
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'replaced'
    is_required BOOLEAN DEFAULT TRUE,
    
    -- Controle
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_user_id INTEGER NOT NULL,  -- FK para user
    notes TEXT,
    
    FOREIGN KEY (japan_process_id) REFERENCES japan_process(id),
    FOREIGN KEY (uploaded_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `japan_payment`
Gerencia pagamentos relacionados aos processos.

```sql
CREATE TABLE japan_payment (
    id INTEGER PRIMARY KEY,
    japan_process_id INTEGER NOT NULL,  -- FK para japan_process
    dojo_id INTEGER NOT NULL,  -- FK para dojo
    
    -- Informações do pagamento
    payment_type VARCHAR(100) NOT NULL,  -- 'examiner_registration', 'examiner_renewal', 'dan_application', 'annual_fee', 'other'
    amount_usd DECIMAL(10, 2),  -- Valor em USD (moeda de referência do Japão)
    amount_brl DECIMAL(10, 2),  -- Valor em BRL (convertido)
    exchange_rate DECIMAL(10, 4),  -- Taxa de câmbio no momento
    
    -- Status do pagamento
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending', 'paid', 'confirmed', 'refunded', 'cancelled'
    payment_method VARCHAR(100),  -- 'bank_transfer', 'paypal', 'credit_card', 'other'
    payment_date DATE,
    confirmation_date DATE,
    
    -- Comprovantes
    payment_proof_path VARCHAR(500),  -- Caminho do comprovante
    receipt_number VARCHAR(100),  -- Número do recibo
    transaction_id VARCHAR(100),  -- ID da transação
    
    -- Notas e observações
    notes TEXT,
    
    -- Controle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER NOT NULL,  -- FK para user
    updated_at DATETIME,
    updated_by_user_id INTEGER,  -- FK para user
    
    FOREIGN KEY (japan_process_id) REFERENCES japan_process(id),
    FOREIGN KEY (dojo_id) REFERENCES dojo(id),
    FOREIGN KEY (created_by_user_id) REFERENCES user(id),
    FOREIGN KEY (updated_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `student_annual_fee`
Gerencia pagamentos de anuidades de cada aluno.

```sql
CREATE TABLE student_annual_fee (
    id INTEGER PRIMARY KEY,
    member_status_id INTEGER NOT NULL,  -- FK para member_status
    dojo_id INTEGER NOT NULL,  -- FK para dojo
    
    -- Ano de referência
    year_reference INTEGER NOT NULL,  -- Ano da anuidade (ex: 2024, 2025)
    
    -- Detalhes financeiros
    amount_brl DECIMAL(10,2) NOT NULL,  -- Valor da anuidade em reais
    discount_percent DECIMAL(5,2) DEFAULT 0,  -- Desconto aplicado (%)
    final_amount DECIMAL(10,2) NOT NULL,  -- Valor final com desconto
    
    -- Status e datas
    status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending', 'paid', 'overdue', 'exempt', 'cancelled'
    due_date DATE NOT NULL,  -- Data de vencimento
    payment_date DATE,  -- Data do pagamento efetivo
    
    -- Informações de pagamento
    payment_method VARCHAR(50),  -- 'cash', 'bank_transfer', 'credit_card', 'pix', 'other'
    transaction_id VARCHAR(255),  -- ID da transação
    receipt_file_path VARCHAR(500),  -- Comprovante digitalizado
    
    -- Observações
    notes TEXT,  -- Motivo de isenção, observações especiais
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER NOT NULL,  -- FK para user
    updated_at DATETIME,
    updated_by_user_id INTEGER,  -- FK para user
    
    FOREIGN KEY (member_status_id) REFERENCES member_status(id),
    FOREIGN KEY (dojo_id) REFERENCES dojo(id),
    FOREIGN KEY (created_by_user_id) REFERENCES user(id),
    FOREIGN KEY (updated_by_user_id) REFERENCES user(id),
    UNIQUE(member_status_id, year_reference)  -- Um pagamento por aluno por ano
);
```

#### Tabela: `exam_document`
Gerencia documentos de exames de Kyu e Dan (1º ao 3º Dan).

```sql
CREATE TABLE exam_document (
    id INTEGER PRIMARY KEY,
    member_status_id INTEGER NOT NULL,  -- FK para member_status (aluno)
    dojo_id INTEGER NOT NULL,  -- FK para dojo onde ocorreu o exame
    
    -- Tipo de exame
    exam_type VARCHAR(50) NOT NULL,  -- 'kyu' ou 'dan'
    grade_tested VARCHAR(50) NOT NULL,  -- '5kyu', '1kyu', '1dan', '2dan', '3dan', etc
    
    -- Datas
    exam_date DATE NOT NULL,  -- Data do exame
    registration_date DATE DEFAULT CURRENT_DATE,  -- Data de registro no sistema
    
    -- Examinador
    examiner_name VARCHAR(255),  -- Nome do examinador responsável
    examiner_member_id INTEGER,  -- FK para member_status do examinador (se cadastrado)
    
    -- Resultado
    result VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'failed', 'cancelled'
    approved_date DATE,  -- Data de aprovação
    grade_notes TEXT,  -- Observações sobre performance/resultado
    
    -- Certificação
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(100),  -- Número do certificado emitido
    certificate_file_path VARCHAR(500),  -- PDF do certificado
    
    -- Observações
    notes TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER NOT NULL,  -- FK para user
    updated_at DATETIME,
    updated_by_user_id INTEGER,  -- FK para user
    
    FOREIGN KEY (member_status_id) REFERENCES member_status(id),
    FOREIGN KEY (dojo_id) REFERENCES dojo(id),
    FOREIGN KEY (examiner_member_id) REFERENCES member_status(id),
    FOREIGN KEY (created_by_user_id) REFERENCES user(id),
    FOREIGN KEY (updated_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `exam_document_file`
Armazena os arquivos/documentos relacionados aos exames (formulários, fotos, comprovantes).

```sql
CREATE TABLE exam_document_file (
    id INTEGER PRIMARY KEY,
    exam_document_id INTEGER NOT NULL,  -- FK para exam_document
    
    -- Tipo de documento
    file_type VARCHAR(100) NOT NULL,  -- 'application_form_aikido', 'application_form_ki_development', 
                                       -- 'recommendation_letter', 'payment_receipt', 'exam_photo', 
                                       -- 'attendance_list', 'result_certificate', 'other'
    
    -- Arquivo
    file_name VARCHAR(255) NOT NULL,  -- Nome original do arquivo
    file_path VARCHAR(500) NOT NULL,  -- Caminho no servidor
    file_size INTEGER,  -- Tamanho em bytes
    mime_type VARCHAR(100),  -- Tipo MIME (application/pdf, image/jpeg, etc)
    
    -- Metadata
    description TEXT,  -- Descrição do documento
    uploaded_by_user_id INTEGER,  -- FK para user
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Flags
    is_required BOOLEAN DEFAULT FALSE,  -- Se é documento obrigatório
    is_verified BOOLEAN DEFAULT FALSE,  -- Se foi verificado/validado
    verified_by_user_id INTEGER,  -- FK para user que verificou
    verified_date DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (exam_document_id) REFERENCES exam_document(id),
    FOREIGN KEY (uploaded_by_user_id) REFERENCES user(id),
    FOREIGN KEY (verified_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `japan_process_history`
Histórico completo de alterações nos processos.

```sql
CREATE TABLE japan_process_history (
    id INTEGER PRIMARY KEY,
    japan_process_id INTEGER NOT NULL,  -- FK para japan_process
    
    -- Mudança registrada
    change_type VARCHAR(100) NOT NULL,  -- 'status_change', 'document_added', 'payment_added', 'note_added', 'other'
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    
    -- Controle
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INTEGER NOT NULL,  -- FK para user
    
    FOREIGN KEY (japan_process_id) REFERENCES japan_process(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES user(id)
);
```

#### Tabela: `japan_deadline`
Controle de prazos e lembretes.

```sql
CREATE TABLE japan_deadline (
    id INTEGER PRIMARY KEY,
    dojo_id INTEGER,  -- FK para dojo (NULL = geral para todos)
    
    -- Informações do prazo
    deadline_type VARCHAR(100) NOT NULL,  -- 'examiner_renewal', 'annual_report', 'payment_due', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline_date DATE NOT NULL,
    
    -- Status e alertas
    status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'completed', 'overdue', 'cancelled'
    alert_days_before INTEGER DEFAULT 30,  -- Alertar X dias antes
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(100),  -- 'yearly', 'monthly', etc
    
    -- Relacionamento com processos
    japan_process_id INTEGER,  -- FK para japan_process (opcional)
    
    -- Controle
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id INTEGER NOT NULL,
    
    FOREIGN KEY (dojo_id) REFERENCES dojo(id),
    FOREIGN KEY (japan_process_id) REFERENCES japan_process(id),
    FOREIGN KEY (created_by_user_id) REFERENCES user(id)
);
```

### 3.2 Extensões em Tabelas Existentes

#### Tabela `dojo` - Adicionar campos
```sql
ALTER TABLE dojo ADD COLUMN japan_registration_number VARCHAR(100);  -- Número de registro no Japão
ALTER TABLE dojo ADD COLUMN japan_affiliation_date DATE;  -- Data de afiliação ao Japão
ALTER TABLE dojo ADD COLUMN annual_fee_status VARCHAR(50);  -- 'paid', 'pending', 'overdue'
ALTER TABLE dojo ADD COLUMN last_report_year INTEGER;  -- Último ano de relatório enviado
ALTER TABLE dojo ADD COLUMN chief_instructor_member_id INTEGER;  -- FK para member_status do Chief Instructor
```

#### Tabela `member_qualification` - Adicionar campos
```sql
ALTER TABLE member_qualification ADD COLUMN japan_registration_number VARCHAR(100);  -- Número de registro no Japão
ALTER TABLE member_qualification ADD COLUMN expiration_date DATE;  -- Data de expiração (para renovações)
ALTER TABLE member_qualification ADD COLUMN renewal_process_id INTEGER;  -- FK para japan_process (último processo de renovação)
ALTER TABLE member_qualification ADD COLUMN needs_renewal BOOLEAN DEFAULT FALSE;  -- Flag indicando necessidade de renovação
```

---

## 4. ORGANIZAÇÃO DE ARQUIVOS E DOCUMENTOS

### 4.1 Estrutura de Pastas Proposta

```
/backend/src/uploads/
├── japan_processes/
│   ├── {dojo_id}/
│   │   ├── {year}/
│   │   │   ├── examiner_registration/
│   │   │   │   ├── {member_name}/
│   │   │   │   │   ├── application_form.pdf
│   │   │   │   │   ├── recommendation_letter.pdf
│   │   │   │   │   ├── pledge.pdf
│   │   │   │   │   └── certificates/
│   │   │   ├── examiner_renewal/
│   │   │   │   └── {member_name}/
│   │   │   ├── lecturer_application/
│   │   │   │   └── {member_name}/
│   │   │   │       ├── application_form_lecturer.pdf
│   │   │   │       ├── recommendation_letter.pdf
│   │   │   │       ├── pledge.pdf
│   │   │   │       └── certificates/
│   │   │   ├── dan_application/
│   │   │   │   └── {member_name}/
│   │   │   ├── membership_report/
│   │   │   │   ├── annual_report.xlsx
│   │   │   │   └── supporting_docs/
│   │   │   └── payments/
│   │   │       ├── proofs/
│   │   │       └── receipts/
├── annual_fees/
│   ├── {dojo_id}/
│   │   ├── {year}/
│   │   │   ├── receipts/
│   │   │   │   ├── {member_name}_{year}_receipt.pdf
│   │   │   └── reports/
│   │   │       ├── monthly_collection_{month}.pdf
│   │   │       └── annual_report_{year}.pdf
├── exams/
│   ├── {dojo_id}/
│   │   ├── kyu/
│   │   │   ├── {year}/
│   │   │   │   ├── {member_name}_{grade}_{date}/
│   │   │   │   │   ├── attendance_list.pdf
│   │   │   │   │   ├── photos/
│   │   │   │   │   │   ├── exam_photo_1.jpg
│   │   │   │   │   │   └── exam_photo_2.jpg
│   │   │   │   │   └── certificate.pdf
│   │   ├── dan/
│   │   │   ├── {year}/
│   │   │   │   ├── {member_name}_{dan}_{date}/
│   │   │   │   │   ├── application_aikido.pdf
│   │   │   │   │   ├── application_ki_development.pdf
│   │   │   │   │   ├── recommendation_letter.pdf
│   │   │   │   │   ├── payment_receipt.pdf
│   │   │   │   │   ├── photos/
│   │   │   │   │   │   ├── exam_photo_1.jpg
│   │   │   │   │   │   └── exam_photo_2.jpg
│   │   │   │   │   ├── attendance_list.pdf
│   │   │   │   │   └── official_certificate_japan.pdf
├── templates/  # Templates de formulários
│   ├── examiner_registration_form.docx
│   ├── examiner_renewal_form.pdf
│   ├── dan_recommendation_form.docx
│   ├── pledge_form.pdf
│   ├── recommendation_letter_template.docx
│   ├── membership_report_template.xlsx
│   ├── application_aikido_grades.pdf
│   ├── application_ki_development_grades.pdf
│   └── kyu_exam_attendance_template.pdf
└── reference_docs/  # Documentação de referência do Japão
    └── (cópia dos docs de /drive/Documentação de referência - Japão/)
```

---

## 5. FUNCIONALIDADES DO SISTEMA

### 5.1 Dashboard "Processos Japão"

#### Visão do Administrador Geral
- Listar todos os processos de todos os dojos
- Filtrar por: dojo, tipo de processo, status, ano
- Visualizar prazos e alertas globais
- Relatórios consolidados (todos os dojos)

#### Visão do Dojo
- Listar processos do próprio dojo
- Criar novos processos
- Acompanhar status de cada processo
- Visualizar histórico completo
- Alertas de prazos e pendências

### 5.2 Gestão de Processos

#### 5.2.1 Registro/Renovação de Examinador
**Fluxo:**
1. Criar processo → Selecionar membro (professor)
2. Preencher formulário (dados podem vir do cadastro do membro)
3. Upload de documentos:
   - Application Form (preenchido)
   - Recommendation Letter (gerada ou upload)
   - Pledge Form (gerado ou upload)
   - Certificados de graduação atual
4. Registrar pagamento
5. Submeter ao Japão (mudar status para "submitted")
6. Aguardar aprovação
7. Marcar como concluído quando aprovado

**Recursos:**
- Geração automática de formulários com dados do membro
- Template de carta de recomendação pré-preenchido
- Validação de documentos obrigatórios
- Cálculo automático de data de expiração (renovação)
- Alertas automáticos 60 dias antes da expiração

#### 5.2.2 Aplicação para Lecturer (Instrutor Certificado)
**Fluxo:**
1. Criar processo → Selecionar membro (candidato a instrutor)
2. Validar pré-requisitos (graduação mínima, experiência de ensino)
3. Preencher formulário com informações do candidato
4. Upload de documentos:
   - Application form for Lecturer (preenchido)
   - Recommendation Letter (gerada ou upload)
   - Pledge Form (gerado ou upload)
   - Certificados de graduação atual (Aikido e Toitsudo)
   - Comprovantes de experiência de ensino (opcional)
5. Registrar pagamento
6. Submeter ao Japão (mudar status para "submitted")
7. Aguardar aprovação
8. Marcar como concluído quando aprovado

**Recursos:**
- Geração automática de formulários com dados do membro
- Template de carta de recomendação pré-preenchido
- Validação de pré-requisitos (graduação mínima, experiência)
- Validação de documentos obrigatórios
- Integração com member_qualification ao aprovar
- Registro de qualificação "lecturer" ao completar processo

**Integração:**
- Ao aprovar → criar/atualizar registro em `member_qualification` com tipo "lecturer"
- Armazenar número de certificado e data de obtenção
- Atualizar is_active para true

#### 5.2.3 Aplicação para Graduação Dan (4º Dan+)
**Fluxo:**
1. Criar processo → Selecionar membro + Dan desejado
2. Validar pré-requisitos (tempo de prática, graduação atual)
3. Upload de documentos:
   - Dan Recommendation Form
   - Recommendation Letter do Chief Instructor
   - Certificado de graduação atual
4. Registrar pagamento
5. Submeter ao Japão
6. Acompanhar até aprovação
7. Registrar nova graduação no sistema quando aprovada

**Recursos:**
- Validação de requisitos mínimos para cada Dan
- Geração automática do Recommendation Form
- Template de carta de recomendação
- Integração com tabela `member_graduation` ao aprovar

#### 5.2.4 Relatório Anual de Membros
**Fluxo:**
1. Criar processo → Selecionar ano de referência
2. Sistema gera relatório automaticamente baseado nos dados:
   - Lista de todos os membros ativos
   - Graduações de cada membro
   - Novos membros no ano
   - Estatísticas do dojo
3. Exportar para Excel (formato do template japonês)
4. Permitir edição/ajustes
5. Upload do relatório final
6. Registrar pagamento (taxa anual)
7. Submeter

**Recursos:**
- Geração automática do relatório em formato Excel
- Mapeamento automático de dados do sistema para template japonês
- Validação de completude
- Histórico de relatórios anteriores

### 5.3 Gestão de Pagamentos

#### Funcionalidades
- Registrar pagamento para cada processo
- Upload de comprovante
- Controle de status (pendente → pago → confirmado)
- Histórico completo de pagamentos por dojo
- Relatório financeiro (total pago por ano, por tipo)
- Alertas de pagamentos pendentes

#### Campos de pagamento
- Tipo de pagamento
- Valor em USD (referência japonesa)
- Valor em BRL
- Taxa de câmbio
- Método de pagamento
- Data do pagamento
- Número de recibo/transação
- Comprovante (upload)

### 5.4 Sistema de Documentos

#### Funcionalidades
- Upload de múltiplos documentos por processo
- Categorização automática (application form, recommendation letter, etc.)
- Visualização inline (PDFs, imagens)
- Download individual ou em lote (ZIP)
- Versionamento (substituir documentos)
- Validação de documentos obrigatórios antes de submeter

#### Tipos de documentos suportados
- PDF, DOCX, DOC (formulários e cartas)
- XLSX, XLS (relatórios)
- JPG, PNG (certificados digitalizados)

### 5.5 Gestão de Anuidades de Alunos

#### Funcionalidades
- Registro de anuidade para cada aluno por ano
- Controle de status de pagamento (pendente, pago, atrasado, isento)
- Upload de comprovante de pagamento
- Cálculo de descontos (se aplicável)
- Alertas de vencimento
- Relatório de inadimplência por dojo
- Histórico completo de pagamentos por aluno

#### Fluxo de Gestão de Anuidade
1. Sistema gera automaticamente registros de anuidade para todos os alunos ativos no início do ano
2. Define data de vencimento (configurável por dojo)
3. Usuário registra pagamentos conforme recebidos
4. Upload de comprovante (opcional)
5. Sistema atualiza status do aluno (active/inactive) baseado em anuidade
6. Alertas para alunos com mais de 30 dias de atraso

#### Relatórios
- Total arrecadado por dojo por ano
- Taxa de inadimplência
- Previsão de receita anual
- Alunos isentos (com justificativa)
- Histórico de pagamentos por aluno

### 5.6 Gestão de Documentos de Exames (Kyu e Dan 1-3)

#### Funcionalidades
- Registro de exame (agendamento)
- Upload de documentos pré-exame:
  - APPLICATION FOR KI AIKIDO GRADES 
  - APPLICATION FOR KI DEVELOPMENT GRADES 
  - Carta de recomendação do instrutor (Para Dan)
  - Comprovante de pagamento da taxa
- Upload de documentos pós-exame:
  - Fotos do comprovante de exame
- Registro de aprovação/reprovação
- Emissão e upload de certificado
- Histórico completo de exames por aluno
- Visualização de todos os documentos anexados

#### Fluxo de Exame Kyu (Local)
1. Criar registro de exame → Selecionar aluno + graduação testada
2. Definir data e examinador
3. Upload de documentos (formulários locais, lista de presença)
4. Realizar exame
5. Registrar resultado (aprovado/reprovado)
6. Upload de fotos (opcional)
7. Emitir certificado (se aprovado)
8. Atualizar graduação na tabela `member_graduation`
9. Arquivar documentos

#### Fluxo de Exame Dan 1-3 (Enviado ao Japão)
1. Criar registro de exame → Selecionar aluno + Dan testado
2. Upload de documentos obrigatórios:
   - APPLICATION FOR KI AIKIDO GRADES preenchido
   - APPLICATION FOR KI DEVELOPMENT GRADES preenchido
   - Carta de recomendação do Chief Instructor
   - Comprovante de pagamento
3. Validação de documentos completos
4. Realizar exame presencial
5. Upload de fotos e resultados
6. Registrar aprovação local
7. Envio dos documentos ao Japão (processo separado)
8. Aguardar confirmação do Japão
9. Ao receber certificado oficial do Japão, fazer upload
10. Atualizar graduação no sistema
11. Arquivar todos os documentos

#### Tipos de Documentos por Tipo de Exame

**Kyu (local):**
- `attendance_list` - Lista de presença
- `exam_photo` - Fotos do exame
- `result_certificate` - Certificado emitido
- `other` - Outros documentos

**Dan 1-3 (Japão):**
- `application_form_aikido` - APPLICATION FOR KI AIKIDO GRADES
- `application_form_ki_development` - APPLICATION FOR KI DEVELOPMENT GRADES
- `recommendation_letter` - Carta de recomendação
- `payment_receipt` - Comprovante de pagamento
- `exam_photo` - Fotos do exame
- `attendance_list` - Lista de presença
- `result_certificate` - Certificado oficial do Japão
- `other` - Outros documentos

#### Validações
- Para Dan: obrigatório ter APPLICATION FOR KI AIKIDO GRADES + APPLICATION FOR KI DEVELOPMENT GRADES
- Para Dan: obrigatório ter carta de recomendação
- Para Dan: obrigatório ter comprovante de pagamento
- Verificar tempo mínimo desde última graduação
- Verificar graduação atual do aluno

#### Integração com Sistema Existente
- Ao aprovar exame, criar registro em `member_graduation`
- Atualizar graduação atual em `member_status`
- Manter histórico completo na tabela `exam_document`
- Todos os arquivos ficam vinculados ao exame em `exam_document_file`

### 5.7 Alertas e Prazos

#### Sistema de Alertas
- Alertas automáticos para:
  - Renovação de examinador (60 dias antes)
  - Relatório anual pendente
  - Pagamentos em atraso
  - Processos parados há muito tempo
  - Anuidades de alunos vencidas (30+ dias)
  - Exames agendados próximos (7 dias antes)
  - Documentos de exame pendentes de upload
- Notificações no sistema (dashboard)
- Opção de envio por email (futuro)

#### Gestão de Prazos
- Calendário de prazos do Japão
- Prazos por dojo
- Prazos gerais (aplicáveis a todos)
- Marcação de prazos como concluídos
- Histórico de cumprimento de prazos

### 5.6 Histórico e Auditoria

#### Log completo de:
- Todas as mudanças de status
- Documentos adicionados/removidos
- Pagamentos registrados
- Notas adicionadas
- Usuário responsável por cada ação
- Data/hora de cada alteração

#### Relatórios de auditoria:
- Histórico de um processo específico
- Histórico de um dojo (todos os processos)
- Histórico de um membro (processos relacionados)
- Timeline visual de eventos

---

## 6. API ENDPOINTS PROPOSTOS

### 6.1 Processos (Japan Processes)

```
GET    /api/japan/processes                    # Listar processos (com filtros)
POST   /api/japan/processes                    # Criar processo
GET    /api/japan/processes/{id}               # Detalhes do processo
PUT    /api/japan/processes/{id}               # Atualizar processo
DELETE /api/japan/processes/{id}               # Excluir processo (soft delete)
PATCH  /api/japan/processes/{id}/status        # Atualizar status
GET    /api/japan/processes/{id}/history       # Histórico do processo
POST   /api/japan/processes/{id}/notes         # Adicionar nota

# Processos específicos
POST   /api/japan/processes/examiner-registration    # Criar registro de examinador
POST   /api/japan/processes/examiner-renewal        # Criar renovação de examinador
POST   /api/japan/processes/lecturer-application    # Criar aplicação para Lecturer
POST   /api/japan/processes/dan-application         # Criar aplicação para Dan
POST   /api/japan/processes/membership-report       # Criar relatório anual
```

### 6.2 Documentos

```
GET    /api/japan/processes/{id}/documents           # Listar documentos do processo
POST   /api/japan/processes/{id}/documents           # Upload documento
GET    /api/japan/documents/{doc_id}                 # Download documento
DELETE /api/japan/documents/{doc_id}                 # Excluir documento
PUT    /api/japan/documents/{doc_id}                 # Substituir documento
GET    /api/japan/processes/{id}/documents/download-all  # Download todos (ZIP)
```

### 6.3 Pagamentos

```
GET    /api/japan/payments                     # Listar pagamentos (com filtros)
POST   /api/japan/processes/{id}/payment       # Registrar pagamento
GET    /api/japan/payments/{id}                # Detalhes do pagamento
PUT    /api/japan/payments/{id}                # Atualizar pagamento
PATCH  /api/japan/payments/{id}/status         # Atualizar status
POST   /api/japan/payments/{id}/proof          # Upload comprovante
```

### 6.4 Prazos e Alertas

```
GET    /api/japan/deadlines                    # Listar prazos
POST   /api/japan/deadlines                    # Criar prazo
PUT    /api/japan/deadlines/{id}               # Atualizar prazo
DELETE /api/japan/deadlines/{id}               # Excluir prazo
GET    /api/japan/alerts                       # Listar alertas ativos
```

### 6.5 Relatórios

```
GET    /api/japan/reports/processes            # Relatório de processos
GET    /api/japan/reports/payments             # Relatório de pagamentos
GET    /api/japan/reports/dojos                # Relatório por dojo
GET    /api/japan/reports/members              # Relatório de membros (anual)
POST   /api/japan/reports/generate-membership  # Gerar relatório de membros (Excel)
```

### 6.6 Anuidades de Alunos

```
GET    /api/annual-fees                           # Listar anuidades (com filtros)
POST   /api/annual-fees                           # Criar registro de anuidade
GET    /api/annual-fees/{id}                      # Detalhes da anuidade
PUT    /api/annual-fees/{id}                      # Atualizar anuidade
PATCH  /api/annual-fees/{id}/status               # Atualizar status
POST   /api/annual-fees/{id}/payment              # Registrar pagamento
POST   /api/annual-fees/{id}/receipt              # Upload comprovante
GET    /api/annual-fees/student/{member_id}       # Histórico de anuidades do aluno
GET    /api/annual-fees/overdue                   # Listar anuidades atrasadas
POST   /api/annual-fees/bulk-generate/{year}      # Gerar anuidades em lote para um ano

# Relatórios de anuidades
GET    /api/annual-fees/reports/collection        # Relatório de arrecadação
GET    /api/annual-fees/reports/overdue           # Relatório de inadimplência
GET    /api/annual-fees/reports/by-dojo           # Relatório por dojo
```

### 6.7 Documentos de Exames (Kyu e Dan 1-3)

```
# Exames
GET    /api/exams                                 # Listar exames (com filtros)
POST   /api/exams                                 # Criar registro de exame
GET    /api/exams/{id}                            # Detalhes do exame
PUT    /api/exams/{id}                            # Atualizar exame
DELETE /api/exams/{id}                            # Excluir exame
PATCH  /api/exams/{id}/result                     # Registrar resultado (aprovado/reprovado)
GET    /api/exams/student/{member_id}             # Histórico de exames do aluno
GET    /api/exams/upcoming                        # Exames agendados próximos
GET    /api/exams/pending-documents               # Exames com documentos pendentes

# Documentos de exames
GET    /api/exams/{id}/documents                  # Listar documentos do exame
POST   /api/exams/{id}/documents                  # Upload documento
GET    /api/exams/documents/{doc_id}              # Download documento
DELETE /api/exams/documents/{doc_id}              # Excluir documento
PUT    /api/exams/documents/{doc_id}              # Substituir documento
PATCH  /api/exams/documents/{doc_id}/verify       # Marcar documento como verificado
GET    /api/exams/{id}/documents/download-all     # Download todos (ZIP)

# Validações de exames
GET    /api/exams/{id}/validate                   # Validar se exame tem todos documentos obrigatórios
GET    /api/exams/templates/{exam_type}           # Download template de formulário (kyu ou dan)

# Relatórios de exames
GET    /api/exams/reports/by-grade                # Relatório por graduação
GET    /api/exams/reports/by-dojo                 # Relatório por dojo
GET    /api/exams/reports/approval-rate           # Taxa de aprovação
```

### 6.8 Templates e Referências

```
GET    /api/japan/templates                    # Listar templates disponíveis
GET    /api/japan/templates/{type}             # Download template específico
GET    /api/japan/reference-docs               # Listar documentação de referência
POST   /api/japan/forms/generate               # Gerar formulário preenchido
```

---

## 7. INTERFACE DO USUÁRIO (Frontend)

### 7.1 Estrutura de Páginas

#### Página Principal: "Processos Japão"
- **Rota:** `/japan-processes`
- **Conteúdo:**
  - Dashboard com estatísticas
  - Lista de processos (tabela/cards)
  - Filtros (tipo, status, ano, membro)
  - Botões de ação (criar processo, relatórios)
  - Alertas e prazos próximos

#### Página: "Novo Processo"
- **Rota:** `/japan-processes/new`
- **Tipos de processo:**
  - Registro de Examinador
  - Renovação de Examinador
  - Aplicação para Dan
  - Relatório Anual
- **Wizard/Steps:**
  1. Selecionar tipo
  2. Informações básicas
  3. Documentos
  4. Pagamento
  5. Revisão e submissão

#### Página: "Detalhes do Processo"
- **Rota:** `/japan-processes/{id}`
- **Conteúdo:**
  - Informações do processo
  - Status e progresso
  - Documentos anexados
  - Informações de pagamento
  - Histórico completo
  - Ações (editar, adicionar documento, mudar status)

#### Página: "Pagamentos"
- **Rota:** `/japan-payments`
- **Conteúdo:**
  - Lista de todos os pagamentos
  - Filtros (dojo, tipo, status, período)
  - Estatísticas financeiras
  - Gráficos (total por ano, por tipo)

#### Página: "Prazos e Alertas"
- **Rota:** `/japan-deadlines`
- **Conteúdo:**
  - Calendário de prazos
  - Lista de alertas ativos
  - Prazos vencidos/próximos
  - Gerenciar prazos

#### Página: "Anuidades"
- **Rota:** `/annual-fees`
- **Conteúdo:**
  - Lista de anuidades (filtros: ano, status, dojo, aluno)
  - Geração em lote de anuidades por ano
  - Registro de pagamentos
  - Upload de comprovantes
  - Relatório de inadimplência
  - Histórico de pagamentos por aluno
  - Estatísticas (arrecadação, taxa de inadimplência)

#### Página: "Exames"
- **Rota:** `/exams`
- **Conteúdo:**
  - Lista de exames (filtros: tipo kyu/dan, data, status, dojo)
  - Criar novo exame (agendamento)
  - Upload de documentos pré/pós-exame
  - Registro de resultados
  - Emissão de certificados
  - Histórico de exames por aluno
  - Exames próximos (calendário)
  - Exames com documentos pendentes

#### Página: "Relatórios"
- **Rota:** `/japan-reports`
- **Conteúdo:**
  - Relatório de processos
  - Relatório financeiro
  - Relatório por dojo
  - Gerador de relatório anual (Excel)
  - Relatório de anuidades
  - Relatório de exames

### 7.2 Componentes Reutilizáveis

#### ProcessCard
- Exibir informações resumidas de um processo
- Status visual (badge colorido)
- Ícone por tipo de processo
- Ações rápidas

#### ProcessTimeline
- Linha do tempo visual do processo
- Eventos principais (criação, documentos, pagamento, submissão, aprovação)
- Indicador de progresso

#### DocumentUploader
- Upload de documentos com drag-and-drop
- Preview de PDFs e imagens
- Validação de tipo e tamanho
- Lista de documentos obrigatórios

#### PaymentForm
- Formulário de registro de pagamento
- Conversão automática USD ↔ BRL
- Upload de comprovante
- Validação de campos

#### AlertBanner
- Banner de alerta para prazos próximos
- Dismissible
- Priorização por urgência

#### AnnualFeeCard
- Card de anuidade de aluno
- Status visual (pago/pendente/atrasado)
- Informações de vencimento e pagamento
- Ações rápidas (registrar pagamento, upload comprovante)
- Indicador de dias de atraso

#### ExamCard
- Card de exame
- Tipo (kyu/dan), graduação testada
- Data do exame, examinador
- Status (pending/approved/failed)
- Documentos anexados (contador)
- Ações rápidas (upload docs, registrar resultado)

#### ExamDocumentChecklist
- Checklist de documentos obrigatórios para exame
- Status de cada documento (pendente/uploaded/verified)
- Botões de upload por tipo de documento
- Validação de completude

---

## 8. FLUXOS DE TRABALHO DETALHADOS

### 8.1 Fluxo: Registro de Novo Examinador

```
1. Usuário do dojo acessa "Processos Japão" → "Novo Processo"
2. Seleciona tipo "Registro de Examinador"
3. Seleciona o membro (professor do dojo) da lista
4. Sistema preenche formulário com dados do membro:
   - Nome, data nascimento, sexo (do cadastro de student)
   - Graduação atual Aikido e Toitsudo (de member_graduation)
   - Endereço, telefone (do cadastro)
   - Chief Instructor (do dojo)
5. Usuário revisa e completa campos faltantes
6. Sistema gera documentos:
   - Application Form (PDF preenchido)
   - Recommendation Letter (template preenchido)
   - Pledge Form (template)
7. Usuário faz upload de certificados de graduação
8. Usuário registra pagamento:
   - Seleciona valor em USD (conforme tabela do Japão)
   - Informa valor pago em BRL e taxa de câmbio
   - Faz upload do comprovante
9. Usuário submete processo
10. Status muda para "submitted"
11. Sistema registra no histórico
12. Sistema cria alerta de renovação para daqui a 2 anos
13. Quando aprovado pelo Japão:
    - Usuário muda status para "approved"
    - Registra número de registro japonês
    - Atualiza member_qualification com japan_registration_number
14. Processo concluído
```

### 8.2 Fluxo: Renovação de Examinador

```
1. Sistema detecta examinador com renovação próxima (60 dias antes)
2. Sistema cria alerta automático no dashboard
3. Usuário acessa alerta → "Renovar Agora"
4. Sistema cria processo de renovação automaticamente:
   - Preenche com dados atuais do examinador
   - Marca como "renewal" (não "new registration")
5. Gera Renewal Form preenchido
6. Usuário faz upload de comprovante de graduação atualizada (se houver mudança)
7. Registra pagamento de renovação
8. Submete
9. Aguarda aprovação
10. Atualiza expiration_date em member_qualification
11. Processo concluído
```

### 8.3 Fluxo: Relatório Anual de Membros

```
1. Sistema alerta sobre prazo de relatório anual (ex: 60 dias antes de 31/12)
2. Usuário acessa "Novo Processo" → "Relatório Anual"
3. Seleciona ano de referência
4. Sistema gera relatório automaticamente:
   - Consulta todos os members do dojo com status 'active'
   - Extrai graduações atuais de cada um
   - Identifica novos membros no ano
   - Calcula estatísticas
5. Sistema gera arquivo Excel no formato do template japonês:
   - Membership_Reports_Template.xls preenchido
6. Usuário revisa o relatório gerado
7. Opcionalmente, faz download, edita externamente e faz re-upload
8. Registra pagamento da taxa anual
9. Submete ao Japão
10. Sistema atualiza dojo.last_report_year
11. Processo concluído
```

### 8.4 Fluxo: Aplicação para Dan (4º Dan+)

```
1. Membro do dojo se candidata a Dan superior
2. Usuário cria processo "Aplicação para Dan"
3. Seleciona membro e Dan desejado (ex: 4º Dan)
4. Sistema valida pré-requisitos:
   - Graduação atual é compatível
   - Tempo mínimo de prática (conforme regras)
   - Exame foi realizado (examination_date)
5. Sistema gera Dan Recommendation Form
6. Sistema gera Recommendation Letter do Chief Instructor (template)
7. Usuário faz upload de:
   - Recommendation Form assinado
   - Recommendation Letter assinada
   - Certificado de Dan atual
   - Fotos do exame (opcional)
8. Registra pagamento
9. Submete ao Japão
10. Aguarda aprovação (pode levar meses)
11. Quando aprovado:
    - Cria nova entrada em member_graduation
    - Marca como is_current = true
    - Registra certificate_number japonês
12. Processo concluído
```

### 8.5 Fluxo: Geração de Anuidades de Alunos

```
1. Admin ou usuário do dojo acessa "Anuidades" → "Gerar Anuidades em Lote"
2. Seleciona ano de referência (ex: 2025)
3. Sistema busca todos os alunos ativos (member_status.status = 'active')
4. Para cada aluno, cria registro em student_annual_fee:
   - year_reference = ano selecionado
   - amount_brl = valor padrão do dojo (configurável)
   - status = 'pending'
   - due_date = data de vencimento padrão (ex: 31/03/2025)
5. Sistema exibe confirmação: "X anuidades criadas para o ano YYYY"
6. Usuário pode agora gerenciar pagamentos individualmente
```

### 8.6 Fluxo: Registro de Pagamento de Anuidade

```
1. Usuário acessa "Anuidades" → filtros para ver pendentes
2. Seleciona anuidade de um aluno
3. Clica em "Registrar Pagamento"
4. Preenche formulário:
   - Data de pagamento
   - Método (PIX, transferência, dinheiro, cartão)
   - Valor pago (permite desconto)
   - ID de transação (se aplicável)
   - Upload de comprovante (opcional)
5. Salva
6. Sistema atualiza:
   - status = 'paid'
   - payment_date = data informada
   - final_amount = valor pago
7. Sistema mantém student ativo (member_status.status = 'active')
8. Notificação: "Pagamento registrado com sucesso"
```

### 8.7 Fluxo: Criação de Exame Kyu (Local)

```
1. Usuário acessa "Exames" → "Novo Exame"
2. Seleciona tipo: "Kyu"
3. Preenche:
   - Aluno (busca por nome)
   - Graduação testada (ex: 3kyu)
   - Data do exame
   - Examinador responsável
4. Salva registro (status = 'pending')
5. Upload de documentos pré-exame (opcional):
   - Lista de presença
6. Realiza exame presencial
7. Após exame, usuário volta ao sistema:
   - Clica em "Registrar Resultado"
   - Seleciona: Aprovado ou Reprovado
   - Adiciona observações (opcional)
8. Se aprovado:
   - Upload de fotos (opcional)
   - Upload ou gerar certificado
   - Sistema cria registro em member_graduation:
     - graduation_type = 'kyu'
     - kyu_rank = graduação testada
     - is_current = true
     - graduation_date = data do exame
     - certificate_number = gerado automaticamente
   - Sistema atualiza member_status com nova graduação
9. Status do exame = 'approved'
10. Documentos arquivados permanentemente
```

### 8.8 Fluxo: Criação de Exame Dan 1-3 (Japão)

```
1. Usuário acessa "Exames" → "Novo Exame"
2. Seleciona tipo: "Dan"
3. Preenche:
   - Aluno (busca por nome)
   - Graduação testada (1dan, 2dan ou 3dan)
   - Data do exame
   - Examinador responsável
4. Sistema valida pré-requisitos:
   - Aluno tem graduação anterior compatível
   - Tempo mínimo desde última graduação
5. Salva registro (status = 'pending')
6. Upload de documentos obrigatórios pré-exame:
   - APPLICATION FOR KI AIKIDO GRADES (PDF preenchido)
   - APPLICATION FOR KI DEVELOPMENT GRADES (PDF preenchido)
   - Carta de recomendação do instrutor
   - Comprovante de pagamento da taxa ao Japão
7. Sistema valida completude dos documentos
8. Realiza exame presencial
9. Upload de documentos pós-exame:
   - Fotos do exame
   - Lista de presença
10. Registra resultado local:
    - Aprovado ou Reprovado
    - Observações do examinador
11. Se aprovado localmente:
    - Envia pacote de documentos ao Japão
    - Aguarda confirmação oficial (pode levar meses)
12. Quando certificado oficial chega do Japão:
    - Upload do certificado PDF
    - Registra certificate_number oficial
    - Cria entrada em member_graduation:
      - graduation_type = 'dan'
      - dan_rank = graduação testada
      - is_current = true
      - graduation_date = data do exame
      - certificate_number = número oficial do Japão
      - certificate_file_path = caminho do certificado
    - Atualiza member_status
13. Status do exame = 'approved'
14. Todos os documentos arquivados permanentemente
```

---

## 9. REGRAS DE NEGÓCIO E VALIDAÇÕES

### 9.1 Validações de Processos

#### Registro/Renovação de Examinador
- Membro deve ter no mínimo 3º Dan em Aikido
- Membro deve ter qualificação Toitsudo ativa
- Não pode haver outro processo de registro/renovação ativo para o mesmo membro
- Documentos obrigatórios: Application Form, Recommendation Letter, Pledge, Certificados

#### Aplicação para Dan (4º Dan+)
- Validar graduação atual (deve ser Dan-1)
- Validar tempo mínimo desde última graduação (conforme regras japonesas)
- Validar que há examination_date registrada
- Documentos obrigatórios: Recommendation Form, Recommendation Letter, Certificado atual

#### Relatório Anual
- Só pode haver 1 relatório por dojo por ano
- Deve incluir todos os membros ativos no ano
- Deadline: geralmente 31/12 de cada ano

### 9.2 Validações de Anuidades

#### Geração de Anuidades
- Não pode gerar anuidades duplicadas (mesmo aluno + ano já existe)
- Apenas alunos com status 'active' recebem anuidade
- Valor padrão configurável por dojo
- Data de vencimento configurável por dojo

#### Pagamento de Anuidades
- Valor final não pode ser negativo
- Desconto não pode exceder 100%
- Alunos com mais de 30 dias de atraso ficam automaticamente 'inactive'
- Histórico de pagamentos não pode ser deletado

### 9.3 Validações de Exames

#### Exames Kyu
- Aluno deve ter graduação anterior compatível
- Não pode ter dois exames ativos para mesmo aluno
- Examinador deve ser cadastrado no sistema (opcional)
- Resultado só pode ser registrado após data do exame

#### Exames Dan 1-3
- Aluno deve ter no mínimo 1kyu para testar 1dan
- Aluno deve ter Dan-1 para testar Dan superior
- Tempo mínimo desde última graduação (conforme regras):
  - 1kyu → 1dan: mínimo 6 meses
  - 1dan → 2dan: mínimo 1 ano
  - 2dan → 3dan: mínimo 2 anos
- Documentos obrigatórios (Dan):
  - APPLICATION FOR KI AIKIDO GRADES
  - APPLICATION FOR KI DEVELOPMENT GRADES
  - Carta de recomendação
  - Comprovante de pagamento
- Certificado oficial do Japão obrigatório para finalizar processo

### 9.4 Permissões de Acesso

#### Admin Geral
- Ver todos os processos de todos os dojos
- Editar todos os processos
- Gerar relatórios consolidados
- Gerenciar templates e documentação de referência
- Ver e gerenciar anuidades de todos os dojos
- Ver e gerenciar exames de todos os dojos

#### Usuário de Dojo
- Ver apenas processos do próprio dojo
- Criar processos para o próprio dojo
- Editar processos do próprio dojo (se status permitir)
- Upload de documentos
- Registrar pagamentos
- Ver e gerenciar anuidades do próprio dojo
- Ver e gerenciar exames do próprio dojo

#### Restrições
- Processos com status "submitted" ou "approved" não podem ser editados (apenas visualizados)
- Documentos não podem ser excluídos após processo ser submetido
- Pagamentos confirmados não podem ser excluídos
- Anuidades pagas não podem ser deletadas (apenas alterado status)
- Exames aprovados não podem ter resultado alterado
- Documentos de exame verificados não podem ser deletados

### 9.5 Estados e Transições de Status

#### Estados possíveis de `japan_process.status`:
1. **draft** - Rascunho, em preparação
2. **pending_documents** - Aguardando documentos
3. **pending_payment** - Aguardando pagamento
4. **ready_to_submit** - Pronto para submeter
5. **submitted** - Submetido ao Japão
6. **under_review** - Em análise pelo Japão
7. **approved** - Aprovado pelo Japão
8. **rejected** - Rejeitado pelo Japão
9. **completed** - Concluído (aprovado + ações finalizadas)
10. **cancelled** - Cancelado

#### Transições permitidas:
- draft → pending_documents (ao criar)
- pending_documents → pending_payment (todos docs enviados)
- pending_payment → ready_to_submit (pagamento registrado)
- ready_to_submit → submitted (ação manual)
- submitted → under_review (quando Japão confirma recebimento)
- under_review → approved OU rejected
- approved → completed (após registrar resultados no sistema)
- qualquer → cancelled (ação manual)

---

## 10. RELATÓRIOS E DASHBOARDS

### 10.1 Dashboard Principal (Processos Japão)

#### Métricas Principais (Cards)
- Total de processos ativos
- Processos pendentes de ação
- Pagamentos pendentes (valor total)
- Prazos próximos (próximos 30 dias)

#### Gráficos
- Processos por status (pizza)
- Processos por tipo (barras)
- Timeline de processos (linha do tempo)
- Pagamentos por mês (linha)

#### Tabela de Processos Recentes
- Últimos 10 processos
- Colunas: Tipo, Membro, Status, Data, Ações

#### Alertas e Prazos
- Lista de alertas urgentes
- Próximos prazos (com countdown)

### 10.2 Relatório de Processos

#### Filtros
- Período (data início/fim)
- Dojo
- Tipo de processo
- Status
- Membro

#### Dados Exibidos
- Lista completa de processos
- Total por tipo
- Total por status
- Taxa de aprovação (aprovados/total)
- Tempo médio de conclusão

#### Exportação
- PDF
- Excel
- CSV

### 10.3 Relatório Financeiro (Pagamentos)

#### Filtros
- Período
- Dojo
- Tipo de pagamento
- Status

#### Dados Exibidos
- Total pago em USD
- Total pago em BRL
- Média de taxa de câmbio
- Pagamentos por tipo (tabela)
- Pagamentos por mês (gráfico)

#### Exportação
- PDF
- Excel

### 10.4 Relatório por Dojo

#### Para cada dojo:
- Total de processos
- Processos ativos/concluídos
- Total pago (USD e BRL)
- Examinadores registrados
- Última data de relatório anual
- Status da taxa anual

### 10.5 Relatório de Anuidades

#### Dashboard de Anuidades
**Métricas Principais:**
- Total arrecadado no ano (valor em BRL)
- Taxa de pagamento (% pagas / total)
- Taxa de inadimplência (% atrasadas / total)
- Total de anuidades pendentes
- Total de anuidades isentas

**Gráficos:**
- Arrecadação mensal (barras)
- Status de anuidades (pizza: pagas/pendentes/atrasadas/isentas)
- Comparativo anual (linha: arrecadação por ano)

#### Filtros
- Ano de referência
- Dojo
- Status (pending, paid, overdue, exempt)
- Aluno

#### Dados Exibidos
- Lista de anuidades com:
  - Aluno (nome)
  - Dojo
  - Ano
  - Valor
  - Status
  - Data de vencimento
  - Data de pagamento (se pago)
  - Dias de atraso (se aplicável)
- Totais por status
- Alunos com histórico de inadimplência

#### Exportação
- PDF (relatório consolidado)
- Excel (lista detalhada)
- CSV (dados brutos)

### 10.6 Relatório de Exames

#### Dashboard de Exames
**Métricas Principais:**
- Total de exames realizados no período
- Taxa de aprovação global (% aprovados / total)
- Exames por tipo (kyu vs dan)
- Exames com documentos pendentes

**Gráficos:**
- Exames por graduação (barras)
- Taxa de aprovação por graduação (barras)
- Exames por mês (linha)
- Distribuição kyu vs dan (pizza)

#### Filtros
- Período (data início/fim)
- Dojo
- Tipo de exame (kyu/dan)
- Graduação testada
- Status (pending/approved/failed)
- Examinador

#### Dados Exibidos
- Lista de exames com:
  - Aluno (nome)
  - Dojo
  - Tipo (kyu/dan)
  - Graduação testada
  - Data do exame
  - Examinador
  - Resultado
  - Documentos anexados (contador)
  - Status de documentos (completo/incompleto)
- Taxa de aprovação por graduação
- Média de tempo entre exames por aluno
- Examinadores mais ativos

#### Relatórios Especiais
- **Histórico de exames por aluno:**
  - Linha do tempo de todas as graduações
  - Tempo entre graduações
  - Taxa de aprovação pessoal
  - Documentos de cada exame
  
- **Relatório de examinadores:**
  - Total de exames conduzidos
  - Taxa de aprovação dos alunos
  - Graduações mais examinadas
  
- **Documentos pendentes:**
  - Exames com documentação incompleta
  - Tipo de documento faltante
  - Dias desde o exame (urgência)

#### Exportação
- PDF (relatório consolidado com gráficos)
- Excel (lista detalhada de exames)
- CSV (dados brutos)
- ZIP (todos os documentos de um exame)

---

## 11. INTEGRAÇÕES E AUTOMATIZAÇÕES

### 11.1 Integração com Sistema Existente

#### Com `member_status` e `member_qualification`
- Ao aprovar registro de examinador → atualizar `member_qualification`:
  - Adicionar `japan_registration_number`
  - Definir `expiration_date` (data de renovação)
  - Marcar `needs_renewal = false`
- Ao se aproximar de `expiration_date` → criar alerta automático

#### Com `member_graduation`
- Ao aprovar aplicação para Dan → criar nova entrada em `member_graduation`:
  - Disciplina: Shinshin Toitsu Aikido
  - Rank: Dan aprovado
  - Examination_date: data do exame
  - Certificate_number: número japonês
  - is_current: true
  - certificate_status: 'issued'
- Atualizar graduações anteriores: `is_current = false`

#### Com `student_annual_fee`
- Verificar status de anuidade ao listar alunos
- Aluno com anuidade atrasada >30 dias → marcar member_status.status = 'inactive'
- Aluno que paga anuidade atrasada → reativar member_status.status = 'active'
- Integrar histórico de pagamentos no perfil do aluno

#### Com `exam_document`
- Ao aprovar exame kyu ou dan (1-3) → criar entrada em `member_graduation`
- Vincular certificado emitido ao registro de graduação
- Atualizar graduação atual do aluno em `member_status`
- Manter histórico completo de exames no perfil do aluno

#### Com `dojo`
- Ao aprovar relatório anual → atualizar `dojo`:
  - `last_report_year` = ano do relatório
  - `annual_fee_status` = 'paid'
- Ao se aproximar do próximo ano → alerta de novo relatório

### 11.2 Automatizações

#### Alertas Automáticos
- **60 dias antes** de expiração de examinador → criar alerta de renovação
- **90 dias antes** do fim do ano → alerta de relatório anual
- **30 dias** após processo "submitted" sem mudança → alerta de follow-up
- **Pagamento pendente** há mais de 15 dias → alerta urgente
- **Anuidade vencida** há mais de 7 dias → alerta para dojo
- **Anuidade atrasada** há mais de 30 dias → marcar aluno como inativo
- **Exame próximo** (7 dias antes) → alerta para dojo e examinador
- **Documentos de exame pendentes** há mais de 15 dias → alerta urgente

#### Geração Automática de Documentos
- Formulários pré-preenchidos com dados do sistema
- Cartas de recomendação com template
- Relatório anual em Excel automaticamente gerado
- Certificados de exames kyu com numeração automática
- Listas de presença de exames

#### Validações Automáticas
- Antes de permitir submissão:
  - Validar que todos os documentos obrigatórios foram enviados
  - Validar que pagamento foi registrado
  - Validar que formulários estão completos
- Antes de aprovar exame dan:
  - Validar documentos obrigatórios (APPLICATION forms)
  - Validar tempo mínimo desde última graduação
  - Validar comprovante de pagamento
- Antes de gerar anuidades:
  - Verificar se já existem anuidades para o ano
  - Verificar se alunos estão ativos

#### Cálculos Automáticos
- Conversão USD ↔ BRL com taxa de câmbio informada
- Data de expiração de examinador (2 anos após registro/renovação)
- Próxima data de relatório anual
- Valor final de anuidade (com desconto aplicado)
- Dias de atraso de anuidade
- Tempo desde última graduação do aluno

#### Processos Automáticos em Lote
- **Job diário:**
  - Verificar anuidades vencidas e marcar como 'overdue'
  - Verificar alunos com anuidade atrasada >30 dias e marcar como 'inactive'
  - Criar alertas de renovação de examinadores
  - Criar alertas de exames próximos
  
- **Job mensal:**
  - Gerar relatório de inadimplência de anuidades
  - Gerar relatório de exames realizados no mês
  
- **Job anual (início do ano):**
  - Opção de gerar anuidades automaticamente para todos os alunos ativos
  - Alerta de relatório anual pendente

---

## 12. PLANO DE IMPLEMENTAÇÃO

### 12.1 Fase 1 - Estrutura Base (Sprint 1-2)

**Banco de Dados:**
- Criar modelos: `JapanProcess`, `JapanProcessDocument`, `JapanPayment`, `JapanProcessHistory`, `JapanDeadline`
- Criar modelos: `StudentAnnualFee`, `ExamDocument`, `ExamDocumentFile`
- Executar migrations
- Adicionar campos em `dojo` e `member_qualification`

**Backend:**
- Criar rotas básicas para CRUD de processos
- Criar rotas básicas para anuidades e exames
- Implementar upload de documentos
- Criar endpoints de listagem e filtros

**Frontend:**
- Criar estrutura de páginas básica
- Implementar listagem de processos, anuidades e exames
- Criar formulário de novo processo (versão simples)
- Criar formulário de nova anuidade e exame

**Migração de Dados:**
- Script para copiar documentos de `/drive` para `/uploads`
- Análise manual de processos históricos (opcional: cadastrar no sistema)

### 12.2 Fase 2 - Funcionalidades Principais (Sprint 3-5)

**Backend:**
- Implementar sistema de documentos completo
- Criar gestão de pagamentos (processos Japão + anuidades)
- Implementar histórico e auditoria
- Validações de negócio (processos, anuidades, exames)
- Sistema de upload de documentos de exames
- Validação de documentos obrigatórios por tipo de exame

**Frontend:**
- Wizard de criação de processos
- Página de detalhes de processo completa
- Upload e gerenciamento de documentos
- Formulário de pagamentos (processos e anuidades)
- Página de gestão de anuidades (lista, filtros, pagamentos)
- Página de gestão de exames (agendamento, documentos, resultados)
- Checklist de documentos de exames

**Integrações:**
- Integração com `member_qualification` e `member_graduation`
- Atualização automática de dados ao aprovar processos
- Atualização de member_status ao registrar pagamento de anuidade
- Criação de member_graduation ao aprovar exame

### 12.3 Fase 3 - Automações e Relatórios (Sprint 6-8)

**Backend:**
- Sistema de alertas e prazos
- Geração automática de relatório anual (Excel)
- Geração de formulários preenchidos
- APIs de relatórios (processos, pagamentos, anuidades, exames)
- Geração em lote de anuidades
- Validação automática de tempo entre graduações

**Frontend:**
- Dashboard com métricas e gráficos (processos, anuidades, exames)
- Página de alertas e prazos
- Página de relatórios com exportação (todos os módulos)
- Calendário de prazos e exames
- Relatório de inadimplência de anuidades
- Relatório de taxa de aprovação de exames
- Histórico completo de anuidades e exames por aluno

**Automatizações:**
- Job para detectar renovações próximas
- Job para alertas de relatório anual
- Validações automáticas pré-submissão
- Job diário de verificação de anuidades
- Job de alertas de exames próximos
- Job de verificação de documentos pendentes

### 12.4 Fase 4 - Refinamentos e Otimizações (Sprint 9-10)

**Features Avançadas:**
- Templates de documentos editáveis
- Sistema de notificações por email
- Controle de versões de documentos
- Assinaturas digitais (futuro)
- Geração automática de certificados de kyu
- Impressão de certificados e listas de presença
- Exportação de histórico completo de aluno (PDF)

**UI/UX:**
- Melhorias de interface
- Responsividade mobile
- Tutoriais e help inline
- Feedback visual aprimorado

**Performance:**
- Otimização de queries
- Cache de relatórios
- Compressão de uploads
- Lazy loading de documentos

### 12.5 Fase 5 - Testes e Deploy (Sprint 9)

**Testes:**
- Testes unitários (backend)
- Testes de integração
- Testes de fluxo completo
- Testes de carga

**Documentação:**
- Manual do usuário
- Documentação técnica da API
- Guia de migração de dados
- FAQs

**Deploy:**
- Deploy em produção
- Treinamento dos usuários
- Monitoramento pós-deploy

---

## 13. TECNOLOGIAS E DEPENDÊNCIAS

### 13.1 Backend (Python/Flask)

**Novas bibliotecas necessárias:**
- `openpyxl` ou `xlsxwriter` - Geração de arquivos Excel
- `python-docx` - Geração de documentos DOCX
- `Pillow` - Manipulação de imagens (validação de uploads)
- `PyPDF2` ou `reportlab` - Geração/manipulação de PDFs
- `celery` (opcional) - Jobs assíncronos para alertas e relatórios

**Atualizar `requirements.txt`:**
```
openpyxl==3.1.2
python-docx==1.1.0
Pillow==10.1.0
PyPDF2==3.0.1
reportlab==4.0.7
```

### 13.2 Frontend (JavaScript)

**Bibliotecas necessárias:**
- Chart.js ou similar - Gráficos no dashboard
- FullCalendar (opcional) - Calendário de prazos
- FilePond ou similar - Upload avançado de arquivos
- jsPDF (opcional) - Geração de PDFs no cliente

### 13.3 Armazenamento

**Estratégia de arquivos:**
- Armazenar documentos em `/backend/src/uploads/japan_processes/`
- Considerar integração com S3/Cloud Storage (futuro)
- Implementar limpeza de arquivos antigos (política de retenção)

---

## 14. CONSIDERAÇÕES DE SEGURANÇA

### 14.1 Controle de Acesso
- Validar permissões em cada endpoint (admin vs dojo user)
- Garantir que usuários só acessem processos de seu dojo
- Logs de auditoria para todas as ações sensíveis

### 14.2 Upload de Arquivos
- Validar tipo MIME real (não apenas extensão)
- Limitar tamanho de upload (ex: 10MB por arquivo)
- Sanitizar nomes de arquivos
- Armazenar fora do webroot
- Scan de vírus (opcional, futuro)

### 14.3 Dados Sensíveis
- Documentos contêm informações pessoais (PII)
- Criptografar dados sensíveis em repouso (opcional)
- HTTPS obrigatório em produção
- Backup regular de banco e documentos

---

## 15. CASOS DE USO E EXEMPLOS

### 15.1 Caso de Uso: Dojo Florianópolis

**Cenário:** Mônica Infante precisa renovar seu registro de examinadora

1. Mônica acessa o sistema
2. Dashboard mostra alerta: "Renovação de Mônica Infante vence em 45 dias"
3. Mônica clica em "Renovar Agora"
4. Sistema abre wizard de renovação com dados pré-preenchidos:
   - Nome: Mônica Infante Gonçalves da Silva
   - Rank Aikido: 4º Dan (obtido em 2020)
   - Rank Toitsudo: Chukyu (obtido em 2018)
   - Dojo: CDKI - Centro de Desenvolvimento de KI Curitiba
5. Sistema gera Renewal Form em PDF
6. Mônica faz upload de certificado atualizado
7. Mônica registra pagamento:
   - Valor: $150 USD
   - Pago: R$ 750,00
   - Taxa câmbio: 5,00
   - Upload de comprovante bancário
8. Mônica submete
9. Status: "submitted"
10. 2 semanas depois, resposta do Japão chega
11. Mônica muda status para "approved"
12. Informa número de registro: JPN-EX-2025-0234
13. Sistema atualiza `member_qualification`:
    - japan_registration_number = "JPN-EX-2025-0234"
    - expiration_date = 2027-03-15
14. Sistema cria novo alerta para renovação em 2027
15. Processo concluído

### 15.2 Caso de Uso: Aplicação para Lecturer

**Cenário:** Luciano Carta, 4º Dan em Aikido, deseja se tornar Lecturer certificado pelo Japão

1. Administrador do dojo acessa o sistema
2. Navega para "Processos Japão" → "Novo Processo"
3. Seleciona tipo: "Aplicação para Lecturer"
4. Seleciona membro: Luciano Carta
5. Sistema valida pré-requisitos:
   - Graduação Aikido: 4º Dan ✓
   - Graduação Toitsudo: Chukyu ✓
   - Experiência de ensino: 8 anos ✓
6. Sistema pré-preenche formulário com dados do membro:
   - Nome completo: Luciano Carta
   - Data nascimento: 15/03/1985
   - Rank Aikido: 4º Dan (obtido em 2019)
   - Rank Toitsudo: Chukyu (obtido em 2017)
   - Dojo: Florianópolis Ki Aikido
7. Sistema gera automaticamente:
   - Application form for Lecturer (PDF pré-preenchido)
   - Pledge Form (PDF)
   - Template de Recommendation Letter
8. Usuário faz upload de documentos:
   - Application form assinado
   - Pledge assinado
   - Recommendation Letter do Chief Instructor
   - Certificados de graduação (Aikido e Toitsudo)
9. Usuário registra pagamento:
   - Valor: $200 USD
   - Pago: R$ 1.000,00
   - Taxa câmbio: 5,00
   - Upload de comprovante
10. Sistema valida documentos obrigatórios: ✓
11. Usuário submete ao Japão
12. Status: "submitted" (enviado em 01/03/2025)
13. Após 3 semanas, resposta chega
14. Usuário atualiza status para "approved"
15. Informa número de certificado: JPN-LEC-2025-0123
16. Sistema automaticamente:
    - Atualiza member_qualification:
      - qualification_type = "lecturer"
      - is_active = true
      - certificate_number = "JPN-LEC-2025-0123"
      - date_obtained = 2025-03-22
17. Processo concluído
18. Luciano Carta agora é Lecturer certificado e pode ministrar aulas oficialmente

### 15.3 Caso de Uso: Admin Geral

**Cenário:** Administrador precisa gerar relatório consolidado de todos os processos de 2024

1. Admin acessa "Relatórios" → "Processos"
2. Seleciona filtros:
   - Período: 01/01/2024 - 31/12/2024
   - Todos os dojos
   - Todos os tipos de processo
3. Sistema gera relatório:
   - Total de processos: 45
   - Por tipo:
     - Registro de Examinador: 8
     - Renovação de Examinador: 15
     - Aplicação para Lecturer: 5
     - Aplicação para Dan: 12
     - Relatório Anual: 10
   - Por status:
     - Concluídos: 38
     - Em andamento: 5
     - Rejeitados: 2
   - Total pago: $8,500 USD (R$ 42,500)
4. Admin exporta para Excel
5. Usa dados para prestação de contas e planejamento

---

## 16. PRÓXIMOS PASSOS E ROADMAP FUTURO

### 16.1 Melhorias Futuras (Pós-MVP)

**Automação Avançada:**
- Integração com API do Japão (se disponível)
- Envio automático de emails ao Japão
- Assinatura digital de documentos
- OCR para extração de dados de certificados
- Geração automática de certificados de kyu personalizados
- Lembretes automáticos de anuidades por email/SMS

**Integrações:**
- Integração com sistema de pagamento (gateway para anuidades)
- Integração com serviço de câmbio (API para taxa automática)
- Integração com Google Drive/Dropbox para backup
- Sistema de pagamento online para anuidades (PIX, cartão)
- QR Code para pagamento de anuidades

**Analytics:**
- Dashboard executivo para Chief Instructor
- Métricas de performance dos dojos
- Previsão de custos anuais
- Análise de tendências
- Análise de taxa de retenção de alunos (baseado em anuidades)
- Análise de progressão de alunos (tempo entre graduações)
- Predição de inadimplência

**Mobile:**
- App mobile para notificações
- Upload de documentos via mobile
- Visualização de processos em andamento
- Pagamento de anuidades via app
- Acesso a certificados digitais

**Gestão de Exames:**
- Sistema de agendamento online de exames
- Notificação automática para alunos agendados
- Checklist digital para examinadores
- Geração de lista de presença automática
- Biblioteca de vídeos de exames (referência)

**Anuidades:**
- Sistema de parcelamento de anuidades
- Descontos automáticos por pagamento antecipado
- Programa de fidelidade (anos consecutivos pagos)
- Integração com sistema de mensalidades (futuro)

### 16.2 Expansão Internacional

**Suporte a outros países:**
- Sistema pode ser adaptado para outras federações
- Templates configuráveis por país
- Multi-idioma (i18n)

---

## 17. MÉTRICAS DE SUCESSO

### 17.1 KPIs do Sistema

**Operacionais:**
- Tempo médio de conclusão de processo
- Taxa de aprovação de processos
- Número de processos concluídos por mês
- Tempo de resposta aos alertas
- Taxa de aprovação em exames por dojo
- Tempo médio entre agendamento e realização de exame

**Qualidade:**
- Processos rejeitados (meta: <5%)
- Documentos faltantes na submissão (meta: 0%)
- Prazos perdidos (meta: 0%)
- Exames com documentação completa (meta: >95%)
- Certificados emitidos no prazo (meta: 100% em até 15 dias)

**Financeiros:**
- Total investido no Japão por ano
- Custo médio por tipo de processo
- Economia de tempo (horas salvas vs processo manual)
- Taxa de arrecadação de anuidades (meta: >90%)
- Taxa de inadimplência (meta: <10%)
- Receita anual por dojo (anuidades)

**Retenção e Crescimento:**
- Taxa de retenção de alunos (baseado em renovação de anuidades)
- Taxa de crescimento de novos alunos
- Taxa de progressão (alunos que fazem exames regularmente)
- Tempo médio de permanência dos alunos

### 17.2 Feedback dos Usuários

**Pesquisas periódicas:**
- Facilidade de uso (1-5)
- Tempo economizado (horas/processo)
- Funcionalidades mais úteis
- Sugestões de melhoria
- Satisfação com gestão de anuidades
- Satisfação com gestão de exames

---

## 18. CONCLUSÃO E RECOMENDAÇÕES

### 18.1 Benefícios do Sistema

**Para os Dojos:**
- Centralização de todos os processos com o Japão
- Histórico completo e rastreável
- Redução de erros e documentos faltantes
- Alertas automáticos de prazos
- Facilidade de submissão e acompanhamento

**Para o Admin/Chief Instructor:**
- Visão consolidada de todos os dojos
- Controle financeiro detalhado
- Relatórios para tomada de decisão
- Auditoria completa

**Para os Membros (Professores):**
- Transparência no processo de graduação/qualificação
- Acompanhamento em tempo real
- Histórico pessoal acessível

### 18.2 Recomendações de Implementação

1. **Começar pequeno:** Implementar primeiro para 1-2 dojos piloto
2. **Migração gradual:** Não forçar migração de todos os dados históricos de uma vez
3. **Treinamento:** Capacitar usuários antes do rollout completo
4. **Feedback contínuo:** Coletar feedback nas primeiras semanas e ajustar
5. **Documentação:** Manter documentação atualizada (manual do usuário)

### 18.3 Riscos e Mitigações

**Risco:** Resistência dos usuários à mudança
**Mitigação:** Treinamento adequado, interface intuitiva, suporte dedicado

**Risco:** Perda de documentos na migração
**Mitigação:** Backup completo antes de migrar, migração em etapas, validação pós-migração

**Risco:** Downtime do sistema em período crítico (próximo a deadlines)
**Mitigação:** Deploy fora de períodos críticos, ambiente de staging, testes rigorosos

**Risco:** Crescimento inesperado de armazenamento
**Mitigação:** Política de retenção de documentos, compressão de arquivos, migração para cloud storage

---

## 19. ANEXOS

### A. Glossário de Termos

- **Ki Society HQ:** Sede mundial do Ki Society no Japão
- **Qualified Examiner:** Examinador qualificado/certificado pelo Japão para aplicar exames de graduação
- **Lecturer:** Professor/instrutor certificado pelo Japão para ministrar aulas e ensinar Ki Aikido oficialmente
- **Dan:** Graduação em artes marciais (faixa preta) - níveis 1 a 10
- **Kyu:** Graduação iniciante em artes marciais (antes do Dan) - níveis 5 a 1
- **Toitsudo:** Disciplina de desenvolvimento do Ki (meditação e princípios)
- **Aikido:** Arte marcial (Shinshin Toitsu Aikido)
- **Chief Instructor:** Instrutor chefe de uma federação/região
- **Pledge:** Termo de compromisso
- **Anuidade:** Pagamento anual obrigatório para manutenção de registro ativo
- **Inadimplência:** Situação de atraso no pagamento de anuidades

**Nota sobre distinção Lecturer vs Qualified Examiner:**
- **Lecturer:** Qualificação para ENSINAR (ministrar aulas regulares)
- **Qualified Examiner:** Qualificação para EXAMINAR (aplicar e avaliar exames de graduação)
- Um instrutor pode ter ambas as qualificações (comum para instrutores seniores)
- Processos e documentação são similares mas independentes

### B. Referências de Documentos

**Principais documentos analisados:**
1. Revised RULES & REGULATIONS 2025.pdf
2. Qualified Examiner registration form.docx
3. YondanandaboveRecommendationForm2023.docx
4. ExampleRecommendationLetterREV.docx
5. Membership_Reports_Template.xls
6. APPLICATION FOR KI AIKIDO GRADES.pdf
7. APPLICATION FOR KI DEVELOPMENT GRADES.pdf

**Arquivos de exemplo:**
- Forms Archive - Lecturer/Mônica Infante/
- Forms Archive - Lecturer/Wilson Sagae/
- Forms Archive - Dan/Lael Keen/
- Forms Archive - Dan/Russell Jones/

### C. Estrutura de Status

**Legenda de cores sugeridas para UI (Processos Japão):**
- 🔵 **draft, pending_documents, pending_payment:** Azul (em preparação)
- 🟡 **ready_to_submit, submitted:** Amarelo (aguardando)
- 🟣 **under_review:** Roxo (em análise)
- 🟢 **approved, completed:** Verde (sucesso)
- 🔴 **rejected, cancelled:** Vermelho (problema)

**Legenda de cores para Anuidades:**
- 🟢 **paid:** Verde (pago)
- 🔵 **pending:** Azul (pendente)
- 🟡 **overdue:** Amarelo (atrasado)
- ⚪ **exempt:** Cinza (isento)
- 🔴 **cancelled:** Vermelho (cancelado)

**Legenda de cores para Exames:**
- 🔵 **pending:** Azul (aguardando exame)
- 🟢 **approved:** Verde (aprovado)
- 🔴 **failed:** Vermelho (reprovado)
- ⚪ **cancelled:** Cinza (cancelado)

---

## RESUMO EXECUTIVO

Este projeto propõe a criação de um **módulo completo de gestão de processos com o Japão, anuidades de alunos e documentos de exames** integrado ao sistema Ki Aikido Brasil existente. O sistema irá:

### Gestão de Processos com o Japão
✅ **Centralizar** todos os processos (registro de examinadores, aplicação para Lecturer, graduações Dan 4+, relatórios anuais)  
✅ **Automatizar** geração de formulários, alertas de prazos e validações  
✅ **Rastrear** pagamentos, documentos e histórico completo  
✅ **Alertar** sobre prazos, renovações e pendências  
✅ **Gerar** relatórios consolidados e analytics  

### Gestão de Anuidades de Alunos
✅ **Controlar** pagamentos anuais de todos os alunos por dojo  
✅ **Automatizar** geração de anuidades em lote  
✅ **Alertar** sobre vencimentos e inadimplências  
✅ **Gerenciar** status de alunos baseado em anuidades  
✅ **Gerar** relatórios financeiros e de inadimplência  

### Gestão de Documentos de Exames (Kyu e Dan 1-3)
✅ **Organizar** toda documentação de exames locais e Dan 1-3  
✅ **Armazenar** formulários oficiais (APPLICATION FOR KI AIKIDO/KI DEVELOPMENT GRADES)  
✅ **Validar** documentos obrigatórios antes de aprovar exames  
✅ **Integrar** com sistema de graduações existente  
✅ **Manter** histórico completo de exames por aluno  
✅ **Gerar** certificados e relatórios de taxa de aprovação  

**Impacto esperado:**
- Redução de 70% no tempo de preparação de processos
- Eliminação de erros por documentos faltantes
- 100% de conformidade com prazos do Japão
- Controle financeiro completo de anuidades (meta: >90% arrecadação)
- Histórico completo e auditável de todos os exames
- Transparência total para dojos e membros
- Gestão profissional de documentação oficial

**Próximo passo:** Aprovação do projeto e início da Fase 1 (estrutura base).

---

*Documento criado em: Outubro 2024*  
*Versão: 2.0 (atualizado com Anuidades e Gestão de Exames)*  
*Autor: Sistema Ki Aikido Brasil - Análise Técnica*
