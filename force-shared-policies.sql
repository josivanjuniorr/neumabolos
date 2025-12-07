-- FORÇAR recriação das políticas compartilhadas
-- Execute este script no Supabase SQL Editor

-- DESABILITAR RLS temporariamente
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- REMOVER TODAS AS POLÍTICAS
DROP POLICY IF EXISTS "Authenticated users can view all ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users can insert ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users can update all ingredients" ON ingredients;
DROP POLICY IF EXISTS "Authenticated users can delete all ingredients" ON ingredients;

DROP POLICY IF EXISTS "Authenticated users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can update all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete all suppliers" ON suppliers;

DROP POLICY IF EXISTS "Authenticated users can view all purchases" ON purchases;
DROP POLICY IF EXISTS "Authenticated users can insert purchases" ON purchases;
DROP POLICY IF EXISTS "Authenticated users can update all purchases" ON purchases;
DROP POLICY IF EXISTS "Authenticated users can delete all purchases" ON purchases;

DROP POLICY IF EXISTS "Authenticated users can view all production" ON daily_production;
DROP POLICY IF EXISTS "Authenticated users can insert production" ON daily_production;
DROP POLICY IF EXISTS "Authenticated users can update all production" ON daily_production;
DROP POLICY IF EXISTS "Authenticated users can delete all production" ON daily_production;

DROP POLICY IF EXISTS "Authenticated users can view all cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Authenticated users can insert cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Authenticated users can update all cash_flow" ON cash_flow;
DROP POLICY IF EXISTS "Authenticated users can delete all cash_flow" ON cash_flow;

DROP POLICY IF EXISTS "Authenticated users can view all clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can update all clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can delete all clients" ON clients;

-- REABILITAR RLS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS SIMPLES E DIRETAS
CREATE POLICY "allow_all_select_ingredients" ON ingredients FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_ingredients" ON ingredients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_ingredients" ON ingredients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_ingredients" ON ingredients FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_all_select_suppliers" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_suppliers" ON suppliers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_suppliers" ON suppliers FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_all_select_purchases" ON purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_purchases" ON purchases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_purchases" ON purchases FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_purchases" ON purchases FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_all_select_production" ON daily_production FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_production" ON daily_production FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_production" ON daily_production FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_production" ON daily_production FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_all_select_cashflow" ON cash_flow FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_cashflow" ON cash_flow FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_cashflow" ON cash_flow FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_cashflow" ON cash_flow FOR DELETE TO authenticated USING (true);

CREATE POLICY "allow_all_select_clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_all_insert_clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_all_update_clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_all_delete_clients" ON clients FOR DELETE TO authenticated USING (true);

-- VERIFICAR
SELECT tablename, policyname, qual::text
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
ORDER BY tablename, cmd;
