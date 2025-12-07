-- Verificar se as políticas compartilhadas estão ativas
-- Execute este script no Supabase SQL Editor

-- Ver as políticas atuais e o que elas permitem
SELECT 
  tablename,
  policyname,
  cmd,
  roles::text,
  CASE 
    WHEN qual = 'true' THEN 'Permite ver TODOS os dados'
    ELSE 'Restringe ao próprio user_id'
  END as tipo_acesso
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients')
  AND cmd = 'SELECT'
ORDER BY tablename;

-- Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ingredients', 'suppliers', 'purchases', 'daily_production', 'cash_flow', 'clients');
