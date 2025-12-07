-- Verificar quem criou os dados e qual user_id está tentando acessar
-- Execute este script no Supabase SQL Editor

-- 1. Ver qual é o seu user_id atual (usuário logado)
SELECT auth.uid() as meu_user_id;

-- 2. Ver os user_id dos dados existentes nas tabelas
SELECT 'ingredients' as tabela, user_id, COUNT(*) as qtd
FROM ingredients
GROUP BY user_id
UNION ALL
SELECT 'suppliers', user_id, COUNT(*)
FROM suppliers
GROUP BY user_id
UNION ALL
SELECT 'purchases', user_id, COUNT(*)
FROM purchases
GROUP BY user_id
UNION ALL
SELECT 'daily_production', user_id, COUNT(*)
FROM daily_production
GROUP BY user_id
UNION ALL
SELECT 'cash_flow', user_id, COUNT(*)
FROM cash_flow
GROUP BY user_id
UNION ALL
SELECT 'clients', user_id, COUNT(*)
FROM clients
GROUP BY user_id;

-- 3. Ver informações dos usuários no sistema
SELECT 
  id,
  email,
  role
FROM user_profiles
ORDER BY created_at;
