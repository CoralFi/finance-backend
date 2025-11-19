-- =====================================================
-- Migration: Add wallet_address column to conduit_transactions
-- =====================================================
-- Esta migración agrega la columna wallet_address a la tabla
-- conduit_transactions para almacenar direcciones de wallets
-- =====================================================

-- Agregar columna wallet_address si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conduit_transactions' 
    AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE conduit_transactions 
    ADD COLUMN wallet_address TEXT;
    
    -- Agregar comentario a la columna
    COMMENT ON COLUMN conduit_transactions.wallet_address IS 
      'Dirección de la wallet asociada a la transacción';
  END IF;
END $$;

-- Crear índice para wallet_address si no existe (útil para búsquedas)
CREATE INDEX IF NOT EXISTS idx_conduit_transactions_wallet_address 
  ON conduit_transactions(wallet_address);

-- =====================================================
-- Finalización
-- =====================================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada: columna wallet_address agregada a conduit_transactions';
END $$;
