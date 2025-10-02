# 👤 Gerenciamento de Perfil e Usuários

Este documento descreve as funcionalidades de gerenciamento de perfil de usuário e administração de usuários do Sistema Ki Aikido.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Perfil do Usuário](#-perfil-do-usuário)
- [Gerenciamento de Usuários (Admin)](#-gerenciamento-de-usuários-admin)
- [Permissões](#-permissões)
- [Como Usar](#-como-usar)

## 🌐 Visão Geral

O Sistema Ki Aikido possui duas áreas principais de gerenciamento de usuários:

1. **Meu Perfil**: Disponível para todos os usuários, permite gerenciar dados pessoais e alterar senha
2. **Gerenciar Usuários**: Disponível apenas para administradores, permite controle completo sobre todos os usuários do sistema

## 👤 Perfil do Usuário

### Funcionalidades Disponíveis

Todos os usuários autenticados podem acessar a seção "Meu Perfil" no menu lateral para:

#### 1. Visualizar Informações do Perfil
- Nome completo
- Email (não editável)
- Tipo de conta (Admin ou Usuário de Dojo)
- Dojo associado (apenas para usuários de dojo)

#### 2. Atualizar Dados Pessoais
- **Nome completo**: Pode ser alterado a qualquer momento
- Clique em "Salvar Alterações" para confirmar

#### 3. Alterar Senha
- Digite a senha atual
- Digite a nova senha
- Confirme a nova senha
- Clique em "Alterar Senha"

**Requisitos de Senha:**
- Senha atual deve estar correta
- Nova senha deve ter pelo menos 6 caracteres
- Nova senha e confirmação devem ser iguais

### Como Acessar

1. Faça login no sistema
2. No menu lateral, clique em "Meu Perfil"
3. Edite os campos desejados
4. Salve as alterações

## 🔧 Gerenciamento de Usuários (Admin)

### Funcionalidades Disponíveis

Usuários com perfil de **Administrador** têm acesso completo ao gerenciamento de usuários:

#### 1. Visualizar Todos os Usuários
- Lista completa de usuários cadastrados
- Visualização de: Nome, Email, Tipo de conta, Dojo, Status
- Indicadores visuais de status (Ativo/Inativo)

#### 2. Criar Novo Usuário
Clique no botão "Novo Usuário" e preencha:

**Campos Obrigatórios:**
- **Nome Completo**: Nome do usuário
- **Email**: Email único no sistema
- **Senha**: Senha de acesso (mínimo 6 caracteres)
- **Tipo de Conta**: 
  - **Administrador**: Acesso total ao sistema
  - **Usuário de Dojo**: Acesso restrito ao próprio dojo

**Campos Condicionais:**
- **Dojo**: Obrigatório para "Usuário de Dojo", oculto para "Administrador"

**Opções:**
- **Usuário ativo**: Marque para ativar o usuário imediatamente

#### 3. Editar Usuário Existente
- Clique no ícone de edição (lápis) na linha do usuário
- Modifique os campos desejados
- **Nota**: A senha não é editada neste formulário (use "Resetar Senha" para isso)

**Campos Editáveis pelo Admin:**
- Nome completo
- Email
- Tipo de conta
- Dojo associado
- Status ativo/inativo

#### 4. Resetar Senha de Usuário
- Clique no ícone de chave na linha do usuário
- Digite a nova senha
- Confirme a nova senha
- Clique em "Resetar"

**Importante:**
- Use esta função quando um usuário esquecer a senha
- A nova senha será aplicada imediatamente
- O usuário poderá alterá-la após o login

#### 5. Ativar/Desativar Usuário
- Clique no ícone de toggle (círculo cortado ou check) na linha do usuário
- Usuários **ativos** podem fazer login
- Usuários **inativos** são bloqueados do sistema

**Restrições:**
- Não é possível desativar a própria conta

#### 6. Excluir Usuário
- Clique no ícone de lixeira na linha do usuário
- Confirme a exclusão
- **Atenção**: Esta ação não pode ser desfeita!

**Restrições:**
- Não é possível excluir a própria conta
- O botão de excluir não aparece para a própria conta

### Como Acessar (Admin)

1. Faça login com uma conta de administrador
2. No menu lateral, clique em "Gerenciar Usuários"
3. Utilize as ações disponíveis em cada linha da tabela

## 🔐 Permissões

### Usuário Normal (Dojo)

✅ **Pode:**
- Visualizar e editar seu próprio perfil
- Alterar sua própria senha
- Ver apenas estudantes/membros do seu dojo
- Criar/editar estudantes no seu dojo

❌ **Não Pode:**
- Ver ou gerenciar outros usuários
- Criar novos usuários
- Acessar dados de outros dojos
- Gerenciar dojos
- Resetar senhas de outros usuários

### Administrador

✅ **Pode:**
- Tudo que um usuário normal pode
- Ver e gerenciar todos os usuários
- Criar novos usuários (admin ou dojo)
- Editar qualquer usuário
- Resetar senha de qualquer usuário
- Ativar/desativar qualquer usuário
- Excluir usuários (exceto a própria conta)
- Ver e gerenciar todos os dojos
- Ver estudantes/membros de todos os dojos
- Criar/editar qualquer dojo

❌ **Não Pode:**
- Excluir ou desativar a própria conta
- Resetar a própria senha via painel admin (use "Meu Perfil")

## 🚀 Como Usar

### Cenário 1: Novo Usuário de Dojo

**Administrador cria conta para responsável de dojo:**

1. Login como admin
2. Menu "Gerenciar Usuários"
3. Clique em "Novo Usuário"
4. Preencha:
   - Nome: "João Silva"
   - Email: "joao.silva@dojo.com"
   - Senha: "senha123"
   - Tipo: "Usuário de Dojo"
   - Dojo: Selecione o dojo correspondente
   - Marque "Usuário ativo"
5. Salve

**Resultado:** João Silva pode fazer login e gerenciar apenas seu dojo.

### Cenário 2: Usuário Esqueceu a Senha

**Administrador reseta senha:**

1. Login como admin
2. Menu "Gerenciar Usuários"
3. Localize o usuário na tabela
4. Clique no ícone de chave (🔑)
5. Digite nova senha: "novasenha123"
6. Confirme a senha
7. Clique em "Resetar"

**Resultado:** Usuário pode fazer login com a nova senha.

### Cenário 3: Desativar Usuário Temporariamente

**Administrador desativa acesso:**

1. Login como admin
2. Menu "Gerenciar Usuários"
3. Localize o usuário na tabela
4. Clique no ícone de desativar (🚫)
5. Confirme a ação

**Resultado:** Usuário não consegue mais fazer login até ser reativado.

### Cenário 4: Usuário Atualiza Próprio Perfil

**Usuário normal ou admin:**

1. Login no sistema
2. Menu "Meu Perfil"
3. Edite o nome se necessário
4. Clique em "Salvar Alterações"

**Para alterar senha:**
1. No mesmo perfil, seção "Alterar Senha"
2. Digite senha atual
3. Digite nova senha (mínimo 6 caracteres)
4. Confirme nova senha
5. Clique em "Alterar Senha"

**Resultado:** Dados atualizados com sucesso.

## 🔍 Tipos de Conta

### Administrador
- **Role**: `admin`
- **Dojo**: Nenhum (null)
- **Acesso**: Sistema completo
- **Uso**: Gestores centrais, coordenação nacional

### Usuário de Dojo
- **Role**: `dojo_user`
- **Dojo**: Obrigatório (ID do dojo)
- **Acesso**: Apenas seu dojo
- **Uso**: Responsáveis locais, instrutores de dojo

## ⚠️ Avisos Importantes

### Segurança
- Sempre use senhas fortes (recomendado: 8+ caracteres com números e símbolos)
- Troque senhas regularmente
- Nunca compartilhe suas credenciais
- Admin: Não compartilhe credenciais de admin

### Boas Práticas
- Desative usuários que saíram ao invés de excluir (mantém histórico)
- Use emails corporativos/oficiais dos dojos
- Defina senhas temporárias fortes ao criar usuários
- Oriente novos usuários a trocar a senha no primeiro acesso

### Limitações
- Não é possível ter dois usuários com mesmo email
- Email não pode ser alterado pelo usuário normal
- Usuários inativos não podem fazer login
- Exclusão de usuário é permanente (sem recuperação)

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. **Usuários normais**: Contate o administrador do sistema
2. **Administradores**: Consulte a documentação técnica em `/docs/API.md`

---

**Versão**: 1.0.0  
**Última atualização**: Junho 2025  
**Sistema Ki Aikido** - Gestão Completa de Academias
