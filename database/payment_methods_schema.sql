-- =====================================================
-- Conduit Payment Methods Database Schema
-- =====================================================
-- Este script crea las tablas necesarias para manejar
-- métodos de pago (bank accounts y wallets) de Conduit
-- =====================================================

-- Tabla para almacenar métodos de pago de customers
CREATE TABLE IF NOT EXISTS conduit_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  payment_method_id TEXT UNIQUE NOT NULL, -- ID del payment method en Conduit (bank_xxx o wlt_xxx)
  customer_id TEXT NOT NULL, -- ID del customer en Conduit
  
  -- Tipo de método de pago
  type TEXT NOT NULL CHECK (type IN ('bank', 'wallet')),
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled', 'pending')),
  
--   Información de cuenta bancaria (cuando type = 'bank')
  bank_name TEXT,
  account_owner_name TEXT,
  account_number TEXT,
  account_type TEXT CHECK (account_type IN ('savings', 'checking', 'electronic_deposit')),
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  branch_code TEXT,
  bank_code TEXT,
  sort_code TEXT,
  pix_key TEXT,
  
  -- Información de wallet (cuando type = 'wallet')
  wallet_address TEXT,
  wallet_label TEXT,
  
  -- Rail/Network
  rail JSONB, -- Array de rails: ["fedwire", "ach", etc.] o "tron", "ethereum", etc.
  
  -- Moneda
  currency TEXT, -- USD, MXN, BRL, etc. o USDT, USDC para wallets
  
  -- Dirección
  address JSONB, -- {streetLine1, city, state, postalCode, country}
  
  -- Información de la entidad asociada
  entity_info JSONB, -- {id, name, entityType, complianceEntityType}
  
  -- Metadata adicional
  metadata JSONB, -- Cualquier información adicional
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamp de Conduit
  conduit_created_at TIMESTAMP WITH TIME ZONE,
  conduit_updated_at TIMESTAMP WITH TIME ZONE
);

-- Comentarios para documentar la tabla
COMMENT ON TABLE conduit_payment_methods IS 'Métodos de pago (cuentas bancarias y wallets) de customers en Conduit';
COMMENT ON COLUMN conduit_payment_methods.payment_method_id IS 'ID único del método de pago en Conduit (bank_xxx o wlt_xxx)';
COMMENT ON COLUMN conduit_payment_methods.customer_id IS 'ID del customer en Conduit al que pertenece este método de pago';
COMMENT ON COLUMN conduit_payment_methods.type IS 'Tipo de método de pago: bank o wallet';
COMMENT ON COLUMN conduit_payment_methods.status IS 'Estado del método de pago: enabled, disabled, pending';
COMMENT ON COLUMN conduit_payment_methods.rail IS 'Rails/redes soportadas en formato JSON array';
COMMENT ON COLUMN conduit_payment_methods.address IS 'Dirección asociada al método de pago en formato JSON';
COMMENT ON COLUMN conduit_payment_methods.entity_info IS 'Información de la entidad asociada en formato JSON';

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payment_methods_payment_method_id 
  ON conduit_payment_methods(payment_method_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id 
  ON conduit_payment_methods(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_type 
  ON conduit_payment_methods(type);

CREATE INDEX IF NOT EXISTS idx_payment_methods_status 
  ON conduit_payment_methods(status);

CREATE INDEX IF NOT EXISTS idx_payment_methods_currency 
  ON conduit_payment_methods(currency);

-- Índice compuesto para búsquedas por customer y tipo
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_type 
  ON conduit_payment_methods(customer_id, type);

-- Índice compuesto para búsquedas por customer y status
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_status 
  ON conduit_payment_methods(customer_id, status);

-- Índice para búsquedas por fecha de creación
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at 
  ON conduit_payment_methods(created_at DESC);

-- =====================================================
-- Función para actualizar updated_at automáticamente
-- =====================================================

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_conduit_payment_methods_updated_at ON conduit_payment_methods;

CREATE TRIGGER update_conduit_payment_methods_updated_at
  BEFORE UPDATE ON conduit_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Vista para métodos de pago activos
-- =====================================================

CREATE OR REPLACE VIEW active_payment_methods AS
SELECT 
  id,
  payment_method_id,
  customer_id,
  type,
  status,
  CASE 
    WHEN type = 'bank' THEN bank_name
    WHEN type = 'wallet' THEN wallet_label
  END as display_name,
  CASE 
    WHEN type = 'bank' THEN account_number
    WHEN type = 'wallet' THEN wallet_address
  END as identifier,
  currency,
  rail,
  created_at,
  updated_at
FROM conduit_payment_methods
WHERE status = 'enabled'
ORDER BY created_at DESC;

COMMENT ON VIEW active_payment_methods IS 
  'Vista de métodos de pago activos con información simplificada';

-- =====================================================
-- Vista para estadísticas de métodos de pago
-- =====================================================

CREATE OR REPLACE VIEW payment_methods_stats AS
SELECT 
  customer_id,
  COUNT(*) as total_methods,
  COUNT(*) FILTER (WHERE type = 'bank') as bank_accounts,
  COUNT(*) FILTER (WHERE type = 'wallet') as wallets,
  COUNT(*) FILTER (WHERE status = 'enabled') as active_methods,
  COUNT(*) FILTER (WHERE status = 'disabled') as disabled_methods,
  COUNT(DISTINCT currency) as currencies_count,
  MAX(created_at) as last_method_added
FROM conduit_payment_methods
GROUP BY customer_id;

COMMENT ON VIEW payment_methods_stats IS 
  'Estadísticas de métodos de pago por customer';

-- =====================================================
-- Políticas de seguridad RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE conduit_payment_methods ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read payment methods"
  ON conduit_payment_methods
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción solo desde el backend
CREATE POLICY "Allow service role to insert payment methods"
  ON conduit_payment_methods
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Política para permitir actualización solo desde el backend
CREATE POLICY "Allow service role to update payment methods"
  ON conduit_payment_methods
  FOR UPDATE
  TO service_role
  USING (true);

-- Política para permitir eliminación solo desde el backend
CREATE POLICY "Allow service role to delete payment methods"
  ON conduit_payment_methods
  FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- Grants de permisos
-- =====================================================

-- Dar permisos de lectura a usuarios autenticados
GRANT SELECT ON conduit_payment_methods TO authenticated;
GRANT SELECT ON active_payment_methods TO authenticated;
GRANT SELECT ON payment_methods_stats TO authenticated;

-- Dar permisos completos al service role
GRANT ALL ON conduit_payment_methods TO service_role;

-- =====================================================
-- Función para limpiar métodos de pago deshabilitados antiguos
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_disabled_payment_methods()
RETURNS void AS $$
BEGIN
  DELETE FROM conduit_payment_methods 
  WHERE status = 'disabled' 
  AND updated_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_disabled_payment_methods() IS 
  'Elimina métodos de pago deshabilitados más antiguos de 180 días';

-- =====================================================
-- Finalización
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Schema de payment methods creado exitosamente!';
  RAISE NOTICE '✓ Tabla creada: conduit_payment_methods';
  RAISE NOTICE '✓ Vistas creadas: active_payment_methods, payment_methods_stats';
  RAISE NOTICE '✓ Índices y políticas de seguridad aplicados';
  RAISE NOTICE '✓ Triggers configurados para updated_at';
END $$;
