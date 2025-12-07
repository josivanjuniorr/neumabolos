-- Corrigir políticas RLS para permitir que todos os usuários autenticados vejam seus próprios dados
-- Execute este script no Supabase SQL Editor

-- ============================================
-- TABELA: ingredients (insumos)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can insert their own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can update their own ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can delete their own ingredients" ON ingredients;

CREATE POLICY "Users can view their own ingredients"
  ON ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients"
  ON ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients"
  ON ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: suppliers (fornecedores)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can view their own suppliers"
  ON suppliers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON suppliers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON suppliers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: purchases (compras)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON purchases;

CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
  ON purchases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
  ON purchases FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: daily_production (produção)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own production" ON daily_production;
DROP POLICY IF EXISTS "Users can insert their own production" ON daily_production;
DROP POLICY IF EXISTS "Users can update their own production" ON daily_production;
DROP POLICY IF EXISTS "Users can delete their own production" ON daily_production;

CREATE POLICY "Users can view their own production"
  ON daily_production FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own production"
  ON daily_production FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production"
  ON daily_production FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production"
  ON daily_production FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: waste (desperdício)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own waste" ON waste;
DROP POLICY IF EXISTS "Users can insert their own waste" ON waste;
DROP POLICY IF EXISTS "Users can update their own waste" ON waste;
DROP POLICY IF EXISTS "Users can delete their own waste" ON waste;

CREATE POLICY "Users can view their own waste"
  ON waste FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own waste"
  ON waste FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waste"
  ON waste FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waste"
  ON waste FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: cash_flow (fluxo de caixa)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Users can insert their own cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Users can update their own cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Users can delete their own cash_flow" ON cash_flow;

CREATE POLICY "Users can view their own cash_flow"
  ON cash_flow FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash_flow"
  ON cash_flow FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash_flow"
  ON cash_flow FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash_flow"
  ON cash_flow FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABELA: clients (clientes)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Verificar políticas aplicadas
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'waste', 'cash_flow', 'clients')
ORDER BY tablename, policyname;
