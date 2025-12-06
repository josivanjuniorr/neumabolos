-- Migração: Atualizar tabela production
-- Adicionar coluna client_name e status, remover estimated_cost e destination
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar nova coluna client_name
ALTER TABLE production 
ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);

-- 2. Adicionar nova coluna status
ALTER TABLE production 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'encomenda';

-- 3. Migrar dados de destination para status (se aplicável)
UPDATE production 
SET status = CASE 
  WHEN destination = 'encomenda' THEN 'encomenda'
  ELSE 'entregue'
END
WHERE destination IS NOT NULL;

-- 4. Remover colunas antigas (CUIDADO: isso apaga os dados dessas colunas)
-- Descomente as linhas abaixo apenas se tiver certeza
-- ALTER TABLE production DROP COLUMN IF EXISTS estimated_cost;
-- ALTER TABLE production DROP COLUMN IF EXISTS destination;

-- 5. Verificar resultado
SELECT 
  id, 
  production_date, 
  product_name, 
  quantity,
  client_name,
  status,
  observations
FROM production
ORDER BY production_date DESC
LIMIT 10;
