-- =====================================================
-- Conduit Documents Database Schema
-- =====================================================
-- Este script crea la tabla para registrar documentos
-- subidos a través de la API de Conduit
-- =====================================================

-- Tabla para registrar documentos subidos a Conduit
CREATE TABLE IF NOT EXISTS conduit_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  conduit_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('transaction', 'counterparty', 'customer')),
  type TEXT NOT NULL CHECK (type IN ('invoice', 'contract')),
  purpose TEXT CHECK (purpose IN ('transaction_justification')),
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentarios para documentar la tabla
COMMENT ON TABLE conduit_documents IS 'Registro de documentos subidos a Conduit Financial';
COMMENT ON COLUMN conduit_documents.document_id IS 'ID del documento en Conduit (ej: doc_2ofTAESrTs4uQ8N3yGBMhGj59jV)';
COMMENT ON COLUMN conduit_documents.conduit_id IS 'ID del usuario/entidad que subió el documento';
COMMENT ON COLUMN conduit_documents.scope IS 'Alcance del documento: transaction, counterparty, customer';
COMMENT ON COLUMN conduit_documents.type IS 'Tipo de documento: invoice, contract';
COMMENT ON COLUMN conduit_documents.purpose IS 'Propósito del documento: transaction_justification';
COMMENT ON COLUMN conduit_documents.file_name IS 'Nombre original del archivo';
COMMENT ON COLUMN conduit_documents.file_size IS 'Tamaño del archivo en bytes';
COMMENT ON COLUMN conduit_documents.mime_type IS 'Tipo MIME del archivo';

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_conduit_documents_document_id 
  ON conduit_documents(document_id);

CREATE INDEX IF NOT EXISTS idx_conduit_documents_conduit_id 
  ON conduit_documents(conduit_id);

CREATE INDEX IF NOT EXISTS idx_conduit_documents_scope 
  ON conduit_documents(scope);

CREATE INDEX IF NOT EXISTS idx_conduit_documents_uploaded_at 
  ON conduit_documents(uploaded_at DESC);

-- Índice compuesto para búsquedas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_conduit_documents_user_date 
  ON conduit_documents(conduit_id, uploaded_at DESC);

-- =====================================================
-- Trigger para actualizar updated_at automáticamente
-- =====================================================

-- Aplicar trigger a conduit_documents
DROP TRIGGER IF EXISTS update_conduit_documents_updated_at ON conduit_documents;
CREATE TRIGGER update_conduit_documents_updated_at
  BEFORE UPDATE ON conduit_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Políticas de seguridad RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en conduit_documents
ALTER TABLE conduit_documents ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read their documents"
  ON conduit_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert documents"
  ON conduit_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir inserción desde el backend
CREATE POLICY "Allow service role to insert documents"
  ON conduit_documents
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- Grants de permisos
-- =====================================================

-- Dar permisos a usuarios autenticados
GRANT SELECT, INSERT ON conduit_documents TO authenticated;

-- Dar permisos completos al service role
GRANT ALL ON conduit_documents TO service_role;

-- =====================================================
-- Vista para estadísticas de documentos (opcional)
-- =====================================================

CREATE OR REPLACE VIEW documents_stats AS
SELECT 
  conduit_id,
  scope,
  type,
  COUNT(*) as total_documents,
  SUM(file_size) as total_size_bytes,
  MIN(uploaded_at) as first_upload,
  MAX(uploaded_at) as last_upload,
  DATE_TRUNC('day', uploaded_at) as upload_date
FROM conduit_documents
GROUP BY conduit_id, scope, type, DATE_TRUNC('day', uploaded_at)
ORDER BY upload_date DESC, total_documents DESC;

COMMENT ON VIEW documents_stats IS 
  'Vista con estadísticas de documentos agrupados por usuario, scope, tipo y fecha';

-- Dar permisos de lectura a la vista
GRANT SELECT ON documents_stats TO authenticated;

-- =====================================================
-- Finalización
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Schema de documentos creado exitosamente!';
  RAISE NOTICE 'Tabla creada: conduit_documents';
  RAISE NOTICE 'Vista creada: documents_stats';
  RAISE NOTICE 'Índices y políticas de seguridad aplicados';
END $$;
