# Verificar e Corrigir Categorias de Compra

## Problema
Erro: `insert or update on table "purchases" violates foreign key constraint "purchases_category_id_fkey"`

## Causa
A tabela `purchase_categories` pode não existir ou não ter categorias cadastradas.

## Solução

### 1. Verificar se a tabela existe

Execute no **Supabase SQL Editor**:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'purchase_categories'
);
```

Se retornar `false`, execute o script `database-update.sql` completo.

### 2. Verificar se há categorias cadastradas

```sql
SELECT * FROM purchase_categories;
```

Se não houver categorias, continue para o passo 3.

### 3. Criar categorias padrão para o seu usuário

**IMPORTANTE**: Substitua `SEU_USER_ID_AQUI` pelo seu ID de usuário real.

Para descobrir seu user_id, execute:

```sql
SELECT id, email FROM auth.users;
```

Depois, crie as categorias:

```sql
INSERT INTO purchase_categories (user_id, name, type, description) VALUES
  ('SEU_USER_ID_AQUI', 'CMV - Matéria Prima', 'CMV', 'Custo de Mercadoria Vendida - Ingredientes'),
  ('SEU_USER_ID_AQUI', 'CMV - Embalagens', 'CMV', 'Custo de Mercadoria Vendida - Embalagens'),
  ('SEU_USER_ID_AQUI', 'Operacional - Energia', 'Operacional', 'Contas de energia elétrica'),
  ('SEU_USER_ID_AQUI', 'Operacional - Água', 'Operacional', 'Contas de água'),
  ('SEU_USER_ID_AQUI', 'Operacional - Aluguel', 'Operacional', 'Aluguel do espaço'),
  ('SEU_USER_ID_AQUI', 'Operacional - Salários', 'Operacional', 'Folha de pagamento'),
  ('SEU_USER_ID_AQUI', 'Operacional - Marketing', 'Operacional', 'Publicidade e marketing'),
  ('SEU_USER_ID_AQUI', 'Operacional - Manutenção', 'Operacional', 'Manutenção de equipamentos'),
  ('SEU_USER_ID_AQUI', 'Imposto - Federal', 'Imposto', 'Impostos federais'),
  ('SEU_USER_ID_AQUI', 'Imposto - Estadual', 'Imposto', 'Impostos estaduais'),
  ('SEU_USER_ID_AQUI', 'Outros', 'Outros', 'Outras despesas não categorizadas')
ON CONFLICT (user_id, name) DO NOTHING;
```

### 4. Verificar se funcionou

```sql
SELECT COUNT(*) FROM purchase_categories WHERE user_id = 'SEU_USER_ID_AQUI';
```

Deve retornar `11`.

### 5. Alternativa: Usar a aplicação

No formulário de compras, clique no botão **"Criar Categorias Padrão"** que aparece quando não há categorias.

## Checklist de Verificação

- [ ] Tabela `purchase_categories` existe
- [ ] Tabela tem RLS habilitado
- [ ] Há categorias cadastradas para o seu usuário
- [ ] O campo `category_id` em `purchases` aceita NULL
- [ ] A foreign key está correta: `purchases.category_id -> purchase_categories.id`
