-- Adicionar coluna production_id na tabela cash_flow para rastrear vendas de produções
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar coluna production_id (referência à daily_production)
ALTER TABLE cash_flow 
ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES daily_production(id) ON DELETE CASCADE;

-- 2. Criar índice para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_cash_flow_production_id ON cash_flow(production_id);

-- 3. Verificar resultado
SELECT 
  id, 
  transaction_date,
  description,
  amount,
  production_id
FROM cash_flow
WHERE production_id IS NOT NULL
ORDER BY transaction_date DESC
LIMIT 10;
