-- =====================================================
-- Conduit Crypto Wallet Deposits Schema
-- =====================================================
-- Tabla para registrar los depósitos de crypto asociados a
-- payment methods o counterparties dentro de Conduit.
-- =====================================================

CREATE TABLE IF NOT EXISTS conduit_crypto_wallet_deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificadores base
  conduit_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,

  -- Referencias locales (al menos una debe existir)
  payment_method_id TEXT REFERENCES conduit_payment_methods(payment_method_id),
  counterparty_id TEXT REFERENCES conduit_counterparties(counterparty_id),

  -- Datos del depósito
  amount NUMERIC(20,8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL,
  transaction_id TEXT REFERENCES conduit_transactions(transaction_id) ON DELETE SET NULL,

  -- Metadata opcional
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validaciones
  CONSTRAINT crypto_wallet_deposits_owner_check
    CHECK (payment_method_id IS NOT NULL OR counterparty_id IS NOT NULL)
);

-- Comentarios
COMMENT ON TABLE conduit_crypto_wallet_deposits IS 'Registro de depósitos recibidos en wallets de Conduit.';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.conduit_id IS 'ID del depósito en Conduit (ej: dep_...).';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.wallet_address IS 'Wallet address donde se recibió el depósito.';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.payment_method_id IS 'Payment method interno asociado (si aplica).';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.counterparty_id IS 'Counterparty interno asociado (si aplica).';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.amount IS 'Monto depositado en unidades del activo.';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.currency IS 'Activo/moneda del depósito (USDC, USDT, etc.).';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.transaction_id IS 'Transaction ID de conduit_transactions cuando se pueda asociar.';
COMMENT ON COLUMN conduit_crypto_wallet_deposits.metadata IS 'JSON libre para datos adicionales (hash, notas, etc.).';

-- Índices
CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_conduit_id
  ON conduit_crypto_wallet_deposits(conduit_id);

CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_wallet_address
  ON conduit_crypto_wallet_deposits(wallet_address);

CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_payment_method
  ON conduit_crypto_wallet_deposits(payment_method_id);

CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_counterparty
  ON conduit_crypto_wallet_deposits(counterparty_id);

CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_transaction
  ON conduit_crypto_wallet_deposits(transaction_id);

-- Índice parcial para owners activos
CREATE INDEX IF NOT EXISTS idx_crypto_wallet_deposits_owner
  ON conduit_crypto_wallet_deposits(payment_method_id, counterparty_id)
  WHERE payment_method_id IS NOT NULL OR counterparty_id IS NOT NULL;

-- =====================================================
-- Trigger: Auto vincular transaction_id al insertar depósitos
-- =====================================================

CREATE OR REPLACE FUNCTION link_transaction_to_crypto_deposit()
RETURNS TRIGGER AS $$
DECLARE
  matched_transaction TEXT;
BEGIN
  IF NEW.transaction_id IS NOT NULL OR NEW.wallet_address IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ct.transaction_id
    INTO matched_transaction
  FROM conduit_transactions ct
  WHERE ct.wallet_address = NEW.wallet_address
    AND ct.transaction_type = 'deposit'
    AND (
      (ct.destination_amount = NEW.amount AND ct.destination_asset = NEW.currency) OR
      (ct.source_amount = NEW.amount AND ct.source_asset = NEW.currency)
    )
  ORDER BY ct.created_at DESC
  LIMIT 1;

  IF matched_transaction IS NOT NULL THEN
    NEW.transaction_id = matched_transaction;
    RAISE NOTICE 'Matched crypto deposit % with transaction % via wallet_address %',
      NEW.conduit_id, matched_transaction, NEW.wallet_address;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_link_transaction_on_crypto_deposits
  ON conduit_crypto_wallet_deposits;

CREATE TRIGGER trigger_link_transaction_on_crypto_deposits
  BEFORE INSERT OR UPDATE OF wallet_address, amount, currency, transaction_id
  ON conduit_crypto_wallet_deposits
  FOR EACH ROW
  EXECUTE FUNCTION link_transaction_to_crypto_deposit();

-- =====================================================
-- Trigger: Backfill cuando llega la transacción
-- =====================================================

CREATE OR REPLACE FUNCTION backfill_crypto_deposit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'deposit' AND NEW.wallet_address IS NOT NULL THEN
    UPDATE conduit_crypto_wallet_deposits
    SET transaction_id = NEW.transaction_id,
        updated_at = NOW()
    WHERE transaction_id IS NULL
      AND wallet_address = NEW.wallet_address
      AND (
        (NEW.destination_amount = amount AND NEW.destination_asset = currency) OR
        (NEW.source_amount = amount AND NEW.source_asset = currency)
      );

    IF FOUND THEN
      RAISE NOTICE 'Linked transaction % to crypto deposit(s) with wallet %',
        NEW.transaction_id, NEW.wallet_address;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_backfill_transaction_in_crypto_deposits
  ON conduit_transactions;

CREATE TRIGGER trigger_backfill_transaction_in_crypto_deposits
  AFTER INSERT OR UPDATE OF wallet_address, transaction_type, destination_amount, source_amount
  ON conduit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION backfill_crypto_deposit_transaction();

-- =====================================================
-- Backfill inicial (opcional)
-- =====================================================

UPDATE conduit_crypto_wallet_deposits ccwd
SET transaction_id = ct.transaction_id,
    updated_at = NOW()
FROM conduit_transactions ct
WHERE ccwd.transaction_id IS NULL
  AND ct.transaction_type = 'deposit'
  AND ccwd.wallet_address = ct.wallet_address
  AND (
    (ct.destination_amount = ccwd.amount AND ct.destination_asset = ccwd.currency) OR
    (ct.source_amount = ccwd.amount AND ct.source_asset = ccwd.currency)
  );


ALTER TABLE conduit_crypto_wallet_deposits
  DROP CONSTRAINT IF EXISTS conduit_crypto_wallet_deposits_payment_method_id_fkey;
ALTER TABLE conduit_crypto_wallet_deposits
  DROP CONSTRAINT IF EXISTS conduit_crypto_wallet_deposits_counterparty_id_fkey;


ALTER TABLE conduit_crypto_wallet_deposits
  ALTER COLUMN payment_method_id TYPE TEXT USING payment_method_id::text,
  ALTER COLUMN counterparty_id TYPE TEXT USING counterparty_id::text;


ALTER TABLE conduit_crypto_wallet_deposits
  ADD CONSTRAINT conduit_crypto_wallet_deposits_payment_method_id_fkey
    FOREIGN KEY (payment_method_id)
    REFERENCES conduit_payment_methods(payment_method_id);

ALTER TABLE conduit_crypto_wallet_deposits
  ADD CONSTRAINT conduit_crypto_wallet_deposits_counterparty_id_fkey
    FOREIGN KEY (counterparty_id)
    REFERENCES conduit_counterparties(counterparty_id);

ALTER TABLE conduit_crypto_wallet_deposits
  ADD CONSTRAINT conduit_crypto_wallet_deposits_unique
    UNIQUE (conduit_id);

-- remove unique constraint
ALTER TABLE conduit_crypto_wallet_deposits
  DROP CONSTRAINT IF EXISTS conduit_crypto_wallet_deposits_unique;


DROP TABLE IF EXISTS conduit_crypto_wallet_deposits;