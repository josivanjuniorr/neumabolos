-- Atualização do Schema: Despesas Operacionais e Categorias de Compras
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela de categorias de compras
CREATE TABLE IF NOT EXISTS purchase_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'CMV', 'Operacional', 'Imposto', 'Outros'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, name)
);

-- 2. Criar tabela de despesas operacionais
CREATE TABLE IF NOT EXISTS operational_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_date DATE NOT NULL,
  category_id UUID REFERENCES purchase_categories(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_form VARCHAR(50), -- 'Dinheiro', 'Pix', 'Cartão Débito', 'Cartão Crédito', 'Boleto'
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Adicionar coluna category_id na tabela purchases (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='purchases' AND column_name='category_id'
  ) THEN
    ALTER TABLE purchases ADD COLUMN category_id UUID REFERENCES purchase_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_purchase_categories_user ON purchase_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_user ON operational_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_date ON operational_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_category ON operational_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_purchases_category ON purchases(category_id);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE purchase_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para purchase_categories
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

-- 7. Criar políticas RLS para operational_expenses
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

-- 8. Inserir categorias padrão para cada usuário existente
-- Nota: Você pode executar isso manualmente ou via aplicação ao fazer login
-- Este é apenas um exemplo de como popular categorias iniciais

-- Exemplo de INSERT (execute após criar as tabelas):
-- INSERT INTO purchase_categories (user_id, name, type, description) VALUES
--   (auth.uid(), 'CMV - Matéria Prima', 'CMV', 'Custo de Mercadoria Vendida - Ingredientes'),
--   (auth.uid(), 'Operacional - Energia', 'Operacional', 'Contas de energia elétrica'),
--   (auth.uid(), 'Operacional - Água', 'Operacional', 'Contas de água'),
--   (auth.uid(), 'Operacional - Aluguel', 'Operacional', 'Aluguel do espaço'),
--   (auth.uid(), 'Operacional - Salários', 'Operacional', 'Folha de pagamento'),
--   (auth.uid(), 'Operacional - Marketing', 'Operacional', 'Publicidade e marketing'),
--   (auth.uid(), 'Imposto - Federal', 'Imposto', 'Impostos federais'),
--   (auth.uid(), 'Imposto - Estadual', 'Imposto', 'Impostos estaduais'),
--   (auth.uid(), 'Imposto - Municipal', 'Imposto', 'Impostos municipais'),
--   (auth.uid(), 'Outros', 'Outros', 'Despesas diversas');
