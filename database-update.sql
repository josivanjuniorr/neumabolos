-- Atualização do Schema: Despesas Operacionais e Categorias de Compras
-- Execute este script no Supabase SQL Editor

-- ============================================
-- PASSO 1: Criar tabela de categorias de compras
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'CMV', 'Operacional', 'Imposto', 'Outros'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- ============================================
-- PASSO 2: Adicionar coluna category_id em purchases
-- ============================================
DO $$ 
BEGIN
  -- Verificar se a coluna já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'purchases' 
      AND column_name = 'category_id'
  ) THEN
    -- Adicionar a coluna
    ALTER TABLE purchases 
    ADD COLUMN category_id UUID;
    
    -- Adicionar a foreign key
    ALTER TABLE purchases
    ADD CONSTRAINT purchases_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES purchase_categories(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Coluna category_id adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna category_id já existe.';
  END IF;
END $$;

-- ============================================
-- PASSO 3: Criar tabela de despesas operacionais
-- ============================================
CREATE TABLE IF NOT EXISTS operational_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_date DATE NOT NULL,
  category_id UUID REFERENCES purchase_categories(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_form VARCHAR(50),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================
-- PASSO 4: Criar índices para melhor performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_purchase_categories_user ON purchase_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_categories_type ON purchase_categories(type);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_user ON operational_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_date ON operational_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_category ON operational_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_category ON purchases(category_id);

-- ============================================
-- PASSO 5: Habilitar RLS (Row Level Security)
-- ============================================
ALTER TABLE purchase_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSO 6: Criar políticas RLS para purchase_categories
-- ============================================
DROP POLICY IF EXISTS "Users can view their own purchase categories" ON purchase_categories;
DROP POLICY IF EXISTS "Users can insert their own purchase categories" ON purchase_categories;
DROP POLICY IF EXISTS "Users can update their own purchase categories" ON purchase_categories;
DROP POLICY IF EXISTS "Users can delete their own purchase categories" ON purchase_categories;

CREATE POLICY "Users can view their own purchase categories"
  ON purchase_categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase categories"
  ON purchase_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase categories"
  ON purchase_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase categories"
  ON purchase_categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASSO 7: Criar políticas RLS para operational_expenses
-- ============================================
DROP POLICY IF EXISTS "Users can view their own operational expenses" ON operational_expenses;
DROP POLICY IF EXISTS "Users can insert their own operational expenses" ON operational_expenses;
DROP POLICY IF EXISTS "Users can update their own operational expenses" ON operational_expenses;
DROP POLICY IF EXISTS "Users can delete their own operational expenses" ON operational_expenses;

CREATE POLICY "Users can view their own operational expenses"
  ON operational_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own operational expenses"
  ON operational_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own operational expenses"
  ON operational_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own operational expenses"
  ON operational_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASSO 8: Inserir categorias padrão para todos os usuários
-- ============================================
INSERT INTO purchase_categories (user_id, name, type, description)
SELECT 
  u.id,
  cat.name,
  cat.type,
  cat.description
FROM auth.users u
CROSS JOIN (
  VALUES
    ('CMV - Matéria Prima', 'CMV', 'Custo de Mercadoria Vendida - Ingredientes'),
    ('CMV - Embalagens', 'CMV', 'Custo de Mercadoria Vendida - Embalagens'),
    ('Operacional - Energia', 'Operacional', 'Contas de energia elétrica'),
    ('Operacional - Água', 'Operacional', 'Contas de água'),
    ('Operacional - Aluguel', 'Operacional', 'Aluguel do espaço'),
    ('Operacional - Salários', 'Operacional', 'Folha de pagamento'),
    ('Operacional - Marketing', 'Operacional', 'Publicidade e marketing'),
    ('Operacional - Manutenção', 'Operacional', 'Manutenção de equipamentos'),
    ('Imposto - Federal', 'Imposto', 'Impostos federais'),
    ('Imposto - Estadual', 'Imposto', 'Impostos estaduais'),
    ('Outros', 'Outros', 'Outras despesas não categorizadas')
) AS cat(name, type, description)
ON CONFLICT (user_id, name) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
  cat_count INTEGER;
  has_column BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'category_id'
  ) INTO has_column;
  
  SELECT COUNT(*) INTO cat_count FROM purchase_categories;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Coluna category_id existe em purchases: %', has_column;
  RAISE NOTICE 'Total de categorias criadas: %', cat_count;
  RAISE NOTICE '========================================';
END $$;
--   (auth.uid(), 'Outros', 'Outros', 'Despesas diversas');
