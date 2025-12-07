-- Script de diagnóstico completo
-- Execute este script linha por linha ou todo de uma vez

-- ========================================
-- 1. Verificar se as tabelas têm dados
-- ========================================
SELECT 'ingredients' as tabela, COUNT(*) as total_registros FROM ingredients
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'daily_production', COUNT(*) FROM daily_production
UNION ALL
SELECT 'cash_flow', COUNT(*) FROM cash_flow
UNION ALL
SELECT 'clients', COUNT(*) FROM clients;

-- ========================================
-- 2. Verificar coluna user_id
-- ========================================
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
  AND column_name = 'user_id';

-- ========================================
-- 3. Verificar RLS habilitado
-- ========================================
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients');

-- ========================================
-- 4. Contar políticas
-- ========================================
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
GROUP BY tablename
ORDER BY tablename;

-- ========================================
-- 5. Ver detalhes das políticas
-- ========================================
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
ORDER BY tablename, cmd;
