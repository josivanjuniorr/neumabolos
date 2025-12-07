-- Políticas RLS compartilhadas - Todos os usuários autenticados veem todos os dados
-- Execute este script no Supabase SQL Editor

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS
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
-- CRIAR POLÍTICAS COMPARTILHADAS
-- Qualquer usuário autenticado pode ver/editar todos os dados
-- ============================================

-- INGREDIENTS (todos podem ver e editar todos os insumos)
CREATE POLICY "Authenticated users can view all ingredients"
  ON ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ingredients"
  ON ingredients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all ingredients"
  ON ingredients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all ingredients"
  ON ingredients FOR DELETE
  TO authenticated
  USING (true);

-- SUPPLIERS (todos podem ver e editar todos os fornecedores)
CREATE POLICY "Authenticated users can view all suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (true);

-- PURCHASES (todos podem ver e editar todas as compras)
CREATE POLICY "Authenticated users can view all purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all purchases"
  ON purchases FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all purchases"
  ON purchases FOR DELETE
  TO authenticated
  USING (true);

-- DAILY_PRODUCTION (todos podem ver e editar todas as produções)
CREATE POLICY "Authenticated users can view all production"
  ON daily_production FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert production"
  ON daily_production FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all production"
  ON daily_production FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all production"
  ON daily_production FOR DELETE
  TO authenticated
  USING (true);

-- CASH_FLOW (todos podem ver e editar todo o fluxo de caixa)
CREATE POLICY "Authenticated users can view all cash_flow"
  ON cash_flow FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cash_flow"
  ON cash_flow FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all cash_flow"
  ON cash_flow FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all cash_flow"
  ON cash_flow FOR DELETE
  TO authenticated
  USING (true);

-- CLIENTS (todos podem ver e editar todos os clientes)
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VERIFICAR RESULTADO
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
