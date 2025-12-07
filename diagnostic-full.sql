-- Script de diagnóstico completo
-- Execute este script e me envie os resultados

-- 1. Verificar se as tabelas existem e têm dados
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

-- 2. Verificar se as tabelas têm coluna user_id
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
  AND column_name = 'user_id';

-- 3. Verificar status do RLS
SELECT 
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients');

-- 4. Contar políticas por tabela
SELECT 
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
GROUP BY tablename
ORDER BY tablename;

-- 5. Ver uma amostra de user_id dos dados existentes
SELECT 'ingredients' as tabela, user_id FROM ingredients LIMIT 1
UNION ALL
SELECT 'suppliers', user_id FROM suppliers LIMIT 1
UNION ALL
SELECT 'purchases', user_id FROM purchases LIMIT 1
UNION ALL
SELECT 'daily_production', user_id FROM daily_production LIMIT 1
UNION ALL
SELECT 'cash_flow', user_id FROM cash_flow LIMIT 1
UNION ALL
SELECT 'clients', user_id FROM clients LIMIT 1;
