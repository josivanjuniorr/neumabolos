-- SOLUÇÃO DEFINITIVA: Remover todas as políticas e recriar com authenticated
-- Execute este script no Supabase SQL Editor

-- ============================================
-- STEP 1: DESABILITAR RLS TEMPORARIAMENTE
-- ============================================
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ============================================
-- STEP 3: REABILITAR RLS
-- ============================================
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CRIAR POLÍTICAS CORRETAS COM AUTHENTICATED
-- ============================================

-- INGREDIENTS
CREATE POLICY "Users can view their own ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients"
  ON ingredients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SUPPLIERS
CREATE POLICY "Users can view their own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- PURCHASES
CREATE POLICY "Users can view their own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
  ON purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
  ON purchases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- DAILY_PRODUCTION
CREATE POLICY "Users can view their own production"
  ON daily_production FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own production"
  ON daily_production FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production"
  ON daily_production FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production"
  ON daily_production FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CASH_FLOW
CREATE POLICY "Users can view their own cash_flow"
  ON cash_flow FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cash_flow"
  ON cash_flow FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash_flow"
  ON cash_flow FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash_flow"
  ON cash_flow FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CLIENTS
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: VERIFICAR RESULTADO
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
ORDER BY tablename, cmd;
