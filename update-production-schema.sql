-- Migração: Atualizar tabela daily_production
-- Adicionar coluna client_name e status, remover estimated_cost e destination
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar nova coluna client_name
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);

-- 2. Adicionar nova coluna status
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'encomenda';

-- 3. Adicionar nova coluna valor
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS valor NUMERIC(10,2);

-- 4. Remover colunas antigas (CUIDADO: isso apaga os dados dessas colunas)
-- Descomente as linhas abaixo apenas se tiver certeza
-- ALTER TABLE daily_production DROP COLUMN IF EXISTS estimated_cost;
-- ALTER TABLE daily_production DROP COLUMN IF EXISTS destination;

-- 5. Verificar resultado
SELECT 
  id, 
  production_date, 
  product_name, 
  quantity,
  client_name,
  status,
  valor,
  observations
FROM daily_production
ORDER BY production_date DESC
LIMIT 10;
