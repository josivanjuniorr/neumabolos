-- Adicionar coluna delivery_time à tabela daily_production
ALTER TABLE daily_production 
ADD COLUMN IF NOT EXISTS delivery_time TIME;

-- Comentário explicativo
COMMENT ON COLUMN daily_production.delivery_time IS 'Horário de entrega da encomenda';
