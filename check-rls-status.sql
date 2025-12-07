-- Verificar e habilitar RLS em todas as tabelas
-- Execute este script no Supabase SQL Editor

-- Habilitar RLS nas tabelas (caso não esteja habilitado)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Verificar status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
ORDER BY tablename;

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
ORDER BY tablename, policyname;
