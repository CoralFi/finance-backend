-- =====================================================
-- Conduit Webhooks Database Schema
-- =====================================================
-- Este script crea las tablas necesarias para manejar
-- webhooks de Conduit en Supabase
-- =====================================================

-- Tabla para registrar todos los eventos de webhook
-- Útil para auditoría y debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  transaction_id TEXT,
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentar la tabla
COMMENT ON TABLE webhook_logs IS 'Registro de todos los eventos de webhook recibidos de Conduit';
COMMENT ON COLUMN webhook_logs.event_type IS 'Tipo de evento (ej: transaction.completed, customer.created)';
COMMENT ON COLUMN webhook_logs.transaction_id IS 'ID de la transacción relacionada (si aplica)';
COMMENT ON COLUMN webhook_logs.payload IS 'Payload completo del webhook en formato JSON';
COMMENT ON COLUMN webhook_logs.idempotency_key IS 'Clave de idempotencia para evitar procesamiento duplicado';
COMMENT ON COLUMN webhook_logs.processed_at IS 'Timestamp de cuando se procesó el webhook';

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id 
  ON webhook_logs(transaction_id);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type 
  ON webhook_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at 
  ON webhook_logs(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_idempotency_key 
  ON webhook_logs(idempotency_key);

-- Índice compuesto para búsquedas por transacción y tipo de evento
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_event 
  ON webhook_logs(transaction_id, event_type);

-- =====================================================
-- Actualizar tabla conduit_transactions si es necesario
-- =====================================================

-- Agregar columna completed_at si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conduit_transactions' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE conduit_transactions 
    ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Agregar índice para transaction_id si no existe
CREATE INDEX IF NOT EXISTS idx_conduit_transactions_transaction_id 
  ON conduit_transactions(transaction_id);

-- Agregar índice para status
CREATE INDEX IF NOT EXISTS idx_conduit_transactions_status 
  ON conduit_transactions(status);

-- Índice compuesto para búsquedas por status y fecha
CREATE INDEX IF NOT EXISTS idx_conduit_transactions_status_created 
  ON conduit_transactions(status, created_at DESC);

-- =====================================================
-- Función para limpiar logs antiguos (opcional)
-- =====================================================

-- Función para eliminar logs de webhook más antiguos de 90 días
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM webhook_logs 
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comentario para la función
COMMENT ON FUNCTION cleanup_old_webhook_logs() IS 
  'Elimina logs de webhook más antiguos de 90 días para mantener la base de datos limpia';

-- =====================================================
-- Vista para estadísticas de webhooks (opcional)
-- =====================================================

CREATE OR REPLACE VIEW webhook_stats AS
SELECT 
  event_type,
  COUNT(*) as total_events,
  COUNT(DISTINCT transaction_id) as unique_transactions,
  MIN(processed_at) as first_event,
  MAX(processed_at) as last_event,
  DATE_TRUNC('day', processed_at) as event_date
FROM webhook_logs
GROUP BY event_type, DATE_TRUNC('day', processed_at)
ORDER BY event_date DESC, total_events DESC;

COMMENT ON VIEW webhook_stats IS 
  'Vista con estadísticas de eventos de webhook agrupados por tipo y fecha';

-- =====================================================
-- Vista para historial de transacciones (opcional)
-- =====================================================

CREATE OR REPLACE VIEW transaction_history AS
SELECT 
  wl.transaction_id,
  wl.event_type,
  wl.processed_at,
  wl.payload->>'version' as webhook_version,
  ct.transaction_type,
  ct.status as current_status,
  ct.source_amount,
  ct.source_asset,
  ct.destination_amount,
  ct.destination_asset
FROM webhook_logs wl
LEFT JOIN conduit_transactions ct ON ct.transaction_id = wl.transaction_id
WHERE wl.transaction_id IS NOT NULL
ORDER BY wl.transaction_id, wl.processed_at DESC;

COMMENT ON VIEW transaction_history IS 
  'Vista que muestra el historial completo de eventos para cada transacción';

-- =====================================================
-- Políticas de seguridad RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read webhook_logs"
  ON webhook_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción solo desde el backend
-- (ajusta según tus necesidades de seguridad)
CREATE POLICY "Allow service role to insert webhook_logs"
  ON webhook_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- Grants de permisos
-- =====================================================

-- Dar permisos de lectura a usuarios autenticados
GRANT SELECT ON webhook_logs TO authenticated;
GRANT SELECT ON webhook_stats TO authenticated;
GRANT SELECT ON transaction_history TO authenticated;

-- Dar permisos completos al service role
GRANT ALL ON webhook_logs TO service_role;

-- =====================================================
-- Trigger para actualizar updated_at automáticamente
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a conduit_transactions si tiene columna updated_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conduit_transactions' 
    AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_conduit_transactions_updated_at ON conduit_transactions;
    CREATE TRIGGER update_conduit_transactions_updated_at
      BEFORE UPDATE ON conduit_transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- Finalización
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Schema de webhooks creado exitosamente!';
  RAISE NOTICE 'Tablas creadas: webhook_logs';
  RAISE NOTICE 'Vistas creadas: webhook_stats, transaction_history';
  RAISE NOTICE 'Índices y políticas de seguridad aplicados';
END $$;
