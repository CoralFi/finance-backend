-- =====================================================
-- Conduit Counterparties Database Schema
-- =====================================================
-- Este script crea las tablas necesarias para manejar
-- counterparties (cuentas bancarias externas) de Conduit
-- =====================================================

-- Tabla para almacenar counterparties
CREATE TABLE IF NOT EXISTS conduit_counterparties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  counterparty_id TEXT UNIQUE NOT NULL, -- ID del counterparty en Conduit (cp_xxx)
  customer_id TEXT NOT NULL, -- ID del customer en Conduit
  
  -- Tipo de counterparty
  type TEXT NOT NULL CHECK (type IN ('individual', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'compliance_rejected', 'in_compliance_review', 'deleted')),
  
  -- Información para Individual
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  birth_date TIMESTAMP WITH TIME ZONE,
  nationality TEXT, -- ISO 3166-1 alpha-3 country code
  
  -- Información para Business
  business_name TEXT,
  website TEXT,
  
  -- Información común
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Identificación
  identification_type TEXT CHECK (identification_type IN ('tin', 'nit', 'cc', 'ce', 'passport', 'cpf', 'cnpj', 'rfc', 'curp', 'cuit', 'cuil')),
  identification_number TEXT,
  
  -- Dirección principal
  address JSONB NOT NULL, -- {streetLine1, streetLine2, city, state, postalCode, country}
  
  -- Payment Methods asociados (array de IDs)
  payment_method_ids JSONB, -- Array de payment method IDs
  
  -- Documentos asociados
  document_ids JSONB, -- Array de document IDs
  
  -- Mensajes de compliance
  messages JSONB, -- Array de mensajes
  
  -- Metadata adicional
  metadata JSONB, -- Cualquier información adicional
  raw_response JSONB, -- Respuesta completa de Conduit API
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Timestamps de Conduit
  conduit_created_at TIMESTAMP WITH TIME ZONE,
  conduit_updated_at TIMESTAMP WITH TIME ZONE
);

-- Comentarios para documentar la tabla
COMMENT ON TABLE conduit_counterparties IS 'Counterparties (cuentas bancarias externas) registradas en Conduit';
COMMENT ON COLUMN conduit_counterparties.counterparty_id IS 'ID único del counterparty en Conduit (cp_xxx)';
COMMENT ON COLUMN conduit_counterparties.customer_id IS 'ID del customer en Conduit al que pertenece este counterparty';
COMMENT ON COLUMN conduit_counterparties.type IS 'Tipo de counterparty: individual o business';
COMMENT ON COLUMN conduit_counterparties.status IS 'Estado del counterparty: active, compliance_rejected, in_compliance_review, deleted';
COMMENT ON COLUMN conduit_counterparties.address IS 'Dirección principal del counterparty en formato JSON';
COMMENT ON COLUMN conduit_counterparties.payment_method_ids IS 'Array de IDs de payment methods asociados';
COMMENT ON COLUMN conduit_counterparties.document_ids IS 'Array de IDs de documentos asociados';
COMMENT ON COLUMN conduit_counterparties.messages IS 'Mensajes de compliance en formato JSON array';
COMMENT ON COLUMN conduit_counterparties.raw_response IS 'Respuesta completa de la API de Conduit para referencia';

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_counterparties_counterparty_id 
  ON conduit_counterparties(counterparty_id);

CREATE INDEX IF NOT EXISTS idx_counterparties_customer_id 
  ON conduit_counterparties(customer_id);

CREATE INDEX IF NOT EXISTS idx_counterparties_type 
  ON conduit_counterparties(type);

CREATE INDEX IF NOT EXISTS idx_counterparties_status 
  ON conduit_counterparties(status);

CREATE INDEX IF NOT EXISTS idx_counterparties_email 
  ON conduit_counterparties(email);

-- Índice compuesto para búsquedas por customer y tipo
CREATE INDEX IF NOT EXISTS idx_counterparties_customer_type 
  ON conduit_counterparties(customer_id, type);

-- Índice compuesto para búsquedas por customer y status
CREATE INDEX IF NOT EXISTS idx_counterparties_customer_status 
  ON conduit_counterparties(customer_id, status);

-- Índice para búsquedas por fecha de creación
CREATE INDEX IF NOT EXISTS idx_counterparties_created_at 
  ON conduit_counterparties(created_at DESC);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX IF NOT EXISTS idx_counterparties_payment_method_ids 
  ON conduit_counterparties USING GIN (payment_method_ids);

CREATE INDEX IF NOT EXISTS idx_counterparties_document_ids 
  ON conduit_counterparties USING GIN (document_ids);

-- =====================================================
-- Función para actualizar updated_at automáticamente
-- =====================================================

-- Crear función si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_conduit_counterparties_updated_at ON conduit_counterparties;

CREATE TRIGGER update_conduit_counterparties_updated_at
  BEFORE UPDATE ON conduit_counterparties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Vista para counterparties activos
-- =====================================================

CREATE OR REPLACE VIEW active_counterparties AS
SELECT 
  id,
  counterparty_id,
  customer_id,
  type,
  status,
  CASE 
    WHEN type = 'individual' THEN CONCAT(first_name, ' ', last_name)
    WHEN type = 'business' THEN business_name
  END as display_name,
  email,
  phone,
  address,
  payment_method_ids,
  created_at,
  updated_at
FROM conduit_counterparties
WHERE status = 'active'
ORDER BY created_at DESC;

COMMENT ON VIEW active_counterparties IS 
  'Vista de counterparties activos con información simplificada';

-- =====================================================
-- Vista para estadísticas de counterparties
-- =====================================================

CREATE OR REPLACE VIEW counterparties_stats AS
SELECT 
  customer_id,
  COUNT(*) as total_counterparties,
  COUNT(*) FILTER (WHERE type = 'individual') as individuals,
  COUNT(*) FILTER (WHERE type = 'business') as businesses,
  COUNT(*) FILTER (WHERE status = 'active') as active_counterparties,
  COUNT(*) FILTER (WHERE status = 'compliance_rejected') as rejected_counterparties,
  COUNT(*) FILTER (WHERE status = 'in_compliance_review') as in_review_counterparties,
  MAX(created_at) as last_counterparty_added
FROM conduit_counterparties
GROUP BY customer_id;

COMMENT ON VIEW counterparties_stats IS 
  'Estadísticas de counterparties por customer';

-- =====================================================
-- Políticas de seguridad RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE conduit_counterparties ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read counterparties"
  ON conduit_counterparties
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción solo desde el backend
CREATE POLICY "Allow service role to insert counterparties"
  ON conduit_counterparties
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Política para permitir actualización solo desde el backend
CREATE POLICY "Allow service role to update counterparties"
  ON conduit_counterparties
  FOR UPDATE
  TO service_role
  USING (true);

-- Política para permitir eliminación solo desde el backend
CREATE POLICY "Allow service role to delete counterparties"
  ON conduit_counterparties
  FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- Grants de permisos
-- =====================================================

-- Dar permisos de lectura a usuarios autenticados
GRANT SELECT ON conduit_counterparties TO authenticated;
GRANT SELECT ON active_counterparties TO authenticated;
GRANT SELECT ON counterparties_stats TO authenticated;

-- Dar permisos completos al service role
GRANT ALL ON conduit_counterparties TO service_role;

-- =====================================================
-- Función para limpiar counterparties eliminados antiguos
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_deleted_counterparties()
RETURNS void AS $$
BEGIN
  DELETE FROM conduit_counterparties 
  WHERE status = 'deleted' 
  AND updated_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_deleted_counterparties() IS 
  'Elimina counterparties con status deleted más antiguos de 180 días';

-- =====================================================
-- Finalización
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Schema de counterparties creado exitosamente!';
  RAISE NOTICE '✓ Tabla creada: conduit_counterparties';
  RAISE NOTICE '✓ Vistas creadas: active_counterparties, counterparties_stats';
  RAISE NOTICE '✓ Índices y políticas de seguridad aplicados';
  RAISE NOTICE '✓ Triggers configurados para updated_at';
END $$;
