# 🗄️ Configuração do Banco de Dados

## ⚠️ IMPORTANTE: Execute este script antes de usar o sistema

O sistema possui funcionalidades adicionais que requerem novas tabelas no banco de dados.

### 📋 Passos para Configuração:

1. **Acesse o Supabase Dashboard**
   - Entre em: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Execute o Script**
   - Copie todo o conteúdo do arquivo `database-update.sql`
   - Cole no editor SQL
   - Clique em **Run** (ou pressione Ctrl+Enter)

4. **Verifique a Execução**
   - Deve aparecer a mensagem de sucesso
   - As seguintes tabelas serão criadas:
     - `purchase_categories` - Categorias de compras (CMV, Operacional, Imposto, etc)
     - `operational_expenses` - Despesas operacionais
   - A coluna `category_id` será adicionada à tabela `purchases`

### ✅ O que o script faz:

- ✅ Cria tabela de categorias de compras
- ✅ Cria tabela de despesas operacionais
- ✅ Adiciona categorização para compras
- ✅ Configura políticas de segurança (RLS)
- ✅ Cria índices para melhor performance

### 🎯 Categorias Padrão:

Após executar o script, o sistema criará automaticamente as seguintes categorias:

**CMV (Custo de Mercadoria Vendida)**
- CMV - Matéria Prima

**Operacional**
- Operacional - Energia
- Operacional - Água
- Operacional - Aluguel
- Operacional - Salários
- Operacional - Marketing
- Operacional - Embalagens

**Impostos**
- Imposto - Federal
- Imposto - Estadual
- Imposto - Municipal

**Outros**
- Outros

### 🔧 Solução de Problemas:

**Erro: "relation does not exist"**
- ✅ Execute o script `database-update.sql` no Supabase

**Categorias não aparecem**
- ✅ Verifique se o script foi executado com sucesso
- ✅ Veja o console do navegador (F12) para logs detalhados
- ✅ As categorias são criadas automaticamente no primeiro acesso

**Erro de permissão**
- ✅ Certifique-se que as políticas RLS foram criadas pelo script
- ✅ Verifique se está logado com o usuário correto

### 📞 Suporte:

Se encontrar problemas, verifique:
1. Console do navegador (F12 → Console)
2. Logs do Supabase (Dashboard → Logs)
3. Que o script SQL foi executado completamente
