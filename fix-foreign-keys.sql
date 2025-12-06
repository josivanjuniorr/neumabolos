-- Script para corrigir problemas de Foreign Key em purchases
-- Execute este script no Supabase SQL Editor

-- 1. Verificar compras com category_id inválido
SELECT 
  p.id,
  p.purchase_date,
  p.category_id,
  p.user_id
FROM purchases p
WHERE p.category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM purchase_categories pc 
    WHERE pc.id = p.category_id
  );

-- 2. Limpar category_id inválidos (definir como NULL)
UPDATE purchases 
SET category_id = NULL 
WHERE category_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM purchase_categories pc 
    WHERE pc.id = purchases.category_id
  );

-- 3. Verificar se ainda existem problemas
SELECT 
  COUNT(*) as total_compras,
  COUNT(category_id) as com_categoria,
  COUNT(*) - COUNT(category_id) as sem_categoria
FROM purchases;

-- 4. Mostrar distribuição por categoria
SELECT 
  COALESCE(pc.name, 'Sem Categoria') as categoria,
  COUNT(*) as quantidade
FROM purchases p
LEFT JOIN purchase_categories pc ON p.category_id = pc.id
GROUP BY pc.name
ORDER BY quantidade DESC;
