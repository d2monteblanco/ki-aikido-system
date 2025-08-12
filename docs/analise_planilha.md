# Análise da Planilha de Inscrições Ki Aikido Brasil

## Resumo dos Dados

- **Total de Registros**: 48 praticantes
- **Total de Colunas**: 8 campos de informação
- **Período**: Dados coletados a partir de setembro de 2023

## Estrutura dos Dados

### Campos Disponíveis

1. **Carimbo de data/hora** - Data/hora da inscrição (100% preenchido)
2. **Dojo** - Academia de origem (100% preenchido)
3. **Nome do praticante** - Nome completo (100% preenchido)
4. **Data de Nascimento** - Data de nascimento (100% preenchido)
5. **Endereço** - Endereço completo (100% preenchido)
6. **Email** - Email de contato (100% preenchido)
7. **Número de inscrição** - Número de registro (100% preenchido, mas muitos "não tenho")
8. **Ano que começou a praticar** - Ano de início (apenas 2 preenchidos, 96% vazios)

## Distribuição por Dojos

| Dojo | Quantidade | Percentual |
|------|------------|------------|
| Florianópolis Ki-Aikido Dojo | 14 | 29.2% |
| CDKI Centro de desenvolvimento de KI | 10 | 20.8% |
| Ki-Aikido Dojo Bagé | 10 | 20.8% |
| Shukikan Ki Society | 7 | 14.6% |
| Centro de desenvolvimento de KI de Belo Horizonte | 4 | 8.3% |
| Rio Ki-Aikido | 3 | 6.3% |

## Observações Importantes

### Qualidade dos Dados
- **Excelente**: Todos os campos principais estão 100% preenchidos
- **Consistência**: Nomes de dojos são consistentes
- **Problema**: Campo "Ano que começou a praticar" quase vazio (apenas 4% preenchido)

### Números de Inscrição
- **Formatos variados**: MKF-0176, MKF0178, Brz 6564
- **Muitos sem número**: "não tenho", "Não tenho", "Não Tenho"
- **Necessita padronização**: Sistema deve gerar números automáticos

### Endereços
- **Formato completo**: Rua, número, bairro, CEP, cidade, estado
- **Múltiplas linhas**: Endereços com quebras de linha
- **Informação rica**: Dados suficientes para localização

## Recomendações para o Sistema

### 1. Modelo de Dados
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE, -- Auto-gerado se vazio
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT NOT NULL,
    dojo_id INTEGER REFERENCES dojos(id),
    registration_date TIMESTAMP DEFAULT NOW(),
    started_practicing_year INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Controle de Acesso
- **Administrador**: Acesso a todos os 48 registros de todos os dojos
- **Usuário Dojo Florianópolis**: Acesso apenas aos 14 registros do seu dojo
- **Usuário Dojo CDKI**: Acesso apenas aos 10 registros do seu dojo
- E assim por diante...

### 3. Funcionalidades Necessárias
- **Importação**: Sistema para importar dados da planilha
- **Geração de Números**: Auto-geração de números de inscrição
- **Validação**: Validação de emails únicos
- **Busca**: Busca por nome, email, número de inscrição
- **Filtros**: Filtro por dojo, status, período

### 4. Interface de Usuário
- **Lista Paginada**: Para visualizar os registros
- **Formulário de Cadastro**: Para novos alunos
- **Edição Inline**: Para atualizar dados
- **Exportação**: Para gerar relatórios

## Mapeamento de Campos

| Campo Planilha | Campo Sistema | Tipo | Observações |
|----------------|---------------|------|-------------|
| Nome do praticante | name | VARCHAR(255) | Remover espaços extras |
| Email | email | VARCHAR(255) | Converter para lowercase |
| Data de Nascimento | birth_date | DATE | Formato YYYY-MM-DD |
| Endereço | address | TEXT | Manter quebras de linha |
| Dojo | dojo_id | INTEGER | Referência para tabela dojos |
| Número de inscrição | registration_number | VARCHAR(50) | Gerar se vazio |
| Carimbo de data/hora | registration_date | TIMESTAMP | Data de inscrição |
| Ano que começou a praticar | started_practicing_year | INTEGER | Opcional |

## Próximos Passos

1. **Criar estrutura do banco de dados**
2. **Implementar sistema de autenticação com roles**
3. **Desenvolver API para CRUD de alunos**
4. **Criar interface web responsiva**
5. **Implementar importação dos dados da planilha**
6. **Testar controle de acesso por dojo**

## Dados de Exemplo para Testes

### Dojos para Cadastro
1. Florianópolis Ki-Aikido Dojo (14 alunos)
2. CDKI Centro de desenvolvimento de KI (10 alunos)
3. Ki-Aikido Dojo Bagé (10 alunos)
4. Shukikan Ki Society (7 alunos)
5. Centro de desenvolvimento de KI de Belo Horizonte (4 alunos)
6. Rio Ki-Aikido (3 alunos)

### Usuários para Teste
- **admin@kiaikido.com** - Administrador geral (acesso total)
- **florianopolis@kiaikido.com** - Responsável Dojo Florianópolis
- **cdki@kiaikido.com** - Responsável CDKI
- **bage@kiaikido.com** - Responsável Dojo Bagé
- **shukikan@kiaikido.com** - Responsável Shukikan
- **belohorizonte@kiaikido.com** - Responsável BH
- **rio@kiaikido.com** - Responsável Rio

