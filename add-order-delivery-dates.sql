-- Adicionar colunas de data de encomenda e data de entrega
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna order_date (data da encomenda)
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS order_date DATE;

-- 2. Adicionar coluna delivery_date (data de entrega)
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- 3. Preencher order_date com production_date para registros existentes (opcional)
UPDATE daily_production 
SET order_date = production_date 
WHERE order_date IS NULL;

-- 4. Verificar resultado
SELECT 
  id, 
  order_date,
  delivery_date,
  production_date, 
  product_name, 
  quantity,
  status
FROM daily_production
ORDER BY production_date DESC
LIMIT 10;
