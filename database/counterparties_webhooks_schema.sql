-- =====================================================
-- Conduit Counterparties Webhooks Logs Schema
-- =====================================================
-- Tabla para registrar eventos de webhook relacionados con counterparties
-- Basado en el esquema general de webhook_logs
-- =====================================================

CREATE TABLE IF NOT EXISTS webhook_counterparty_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  counterparty_id TEXT,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE webhook_counterparty_logs IS 'Registro de eventos de webhook de Conduit relacionados con counterparties';
COMMENT ON COLUMN webhook_counterparty_logs.event_type IS 'Tipo de evento (ej: counterparty.active, counterparty.compliance_rejected)';
COMMENT ON COLUMN webhook_counterparty_logs.counterparty_id IS 'ID del counterparty relacionado (cp_xxx)';
COMMENT ON COLUMN webhook_counterparty_logs.payload IS 'Payload completo del webhook en formato JSON';
COMMENT ON COLUMN webhook_counterparty_logs.idempotency_key IS 'Clave de idempotencia para evitar procesamiento duplicado';
COMMENT ON COLUMN webhook_counterparty_logs.processed_at IS 'Timestamp de cuando se procesó el webhook';

CREATE INDEX IF NOT EXISTS idx_webhook_counterparty_logs_counterparty_id 
  ON webhook_counterparty_logs(counterparty_id);

CREATE INDEX IF NOT EXISTS idx_webhook_counterparty_logs_event_type 
  ON webhook_counterparty_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_counterparty_logs_processed_at 
  ON webhook_counterparty_logs(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_counterparty_logs_idempotency_key 
  ON webhook_counterparty_logs(idempotency_key);

ALTER TABLE webhook_counterparty_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read webhook_counterparty_logs"
  ON webhook_counterparty_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to insert webhook_counterparty_logs"
  ON webhook_counterparty_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

GRANT SELECT ON webhook_counterparty_logs TO authenticated;
GRANT ALL ON webhook_counterparty_logs TO service_role;

-- =====================================================
-- Vista para historial de counterparties (opcional)
-- =====================================================

CREATE OR REPLACE VIEW counterparty_history AS
SELECT 
  wcl.counterparty_id,
  wcl.event_type,
  wcl.processed_at,
  wcl.payload->>'version' as webhook_version,
  cc.customer_id,
  cc.type,
  cc.status as current_status,
  cc.email,
  cc.phone,
  cc.created_at,
  cc.updated_at
FROM webhook_counterparty_logs wcl
LEFT JOIN conduit_counterparties cc 
  ON cc.counterparty_id = wcl.counterparty_id
WHERE wcl.counterparty_id IS NOT NULL
ORDER BY wcl.counterparty_id, wcl.processed_at DESC;

COMMENT ON VIEW counterparty_history IS 
  'Historial completo de eventos de webhook para cada counterparty.';

GRANT SELECT ON counterparty_history TO authenticated;
