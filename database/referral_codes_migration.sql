-- =====================================================
-- Referral Codes Migration
-- Agrega referral_code y referred_by_code a usuarios y business
-- + generación automática de referral_code único
-- + función para validar si un referral_code existe en ambas tablas
-- =====================================================

-- 1) Agregar columnas nuevas
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

ALTER TABLE public.business
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

-- 2) Índices únicos (solo cuando referral_code no es null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_referral_code_unique
  ON public.usuarios (referral_code)
  WHERE referral_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_referral_code_unique
  ON public.business (referral_code)
  WHERE referral_code IS NOT NULL;

-- Índices para búsquedas por referido
CREATE INDEX IF NOT EXISTS idx_usuarios_referred_by_code
  ON public.usuarios (referred_by_code);

CREATE INDEX IF NOT EXISTS idx_business_referred_by_code
  ON public.business (referred_by_code);

-- 3) Función para generar código único global (usuarios + business)
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  candidate TEXT;
BEGIN
  LOOP
    -- Código alfanumérico en mayúsculas (10 chars)
    candidate := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 10));

    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.usuarios u WHERE u.referral_code = candidate
      UNION ALL
      SELECT 1 FROM public.business b WHERE b.referral_code = candidate
    );
  END LOOP;

  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_unique_referral_code()
IS 'Genera un referral_code único validando colisión entre usuarios y business';

-- 4) Trigger function para asignar referral_code al crear registro
CREATE OR REPLACE FUNCTION public.assign_referral_code_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR BTRIM(NEW.referral_code) = '' THEN
    NEW.referral_code := public.generate_unique_referral_code();
  ELSE
    NEW.referral_code := UPPER(BTRIM(NEW.referral_code));

    IF EXISTS (
      SELECT 1 FROM public.usuarios u WHERE u.referral_code = NEW.referral_code
      UNION ALL
      SELECT 1 FROM public.business b WHERE b.referral_code = NEW.referral_code
    ) THEN
      RAISE EXCEPTION 'referral_code % ya existe', NEW.referral_code;
    END IF;
  END IF;

  IF NEW.referred_by_code IS NOT NULL THEN
    NEW.referred_by_code := UPPER(BTRIM(NEW.referred_by_code));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.assign_referral_code_on_insert()
IS 'Asigna referral_code automáticamente antes de INSERT y normaliza códigos';

-- 5) Triggers en ambas tablas
DROP TRIGGER IF EXISTS trg_assign_referral_code_usuarios ON public.usuarios;
CREATE TRIGGER trg_assign_referral_code_usuarios
  BEFORE INSERT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_referral_code_on_insert();

DROP TRIGGER IF EXISTS trg_assign_referral_code_business ON public.business;
CREATE TRIGGER trg_assign_referral_code_business
  BEFORE INSERT ON public.business
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_referral_code_on_insert();

-- 6) Backfill para registros existentes sin referral_code
UPDATE public.usuarios
SET referral_code = public.generate_unique_referral_code()
WHERE referral_code IS NULL OR BTRIM(referral_code) = '';

UPDATE public.business
SET referral_code = public.generate_unique_referral_code()
WHERE referral_code IS NULL OR BTRIM(referral_code) = '';

-- 7) Función solicitada: validar si un referral_code existe en usuarios o business
CREATE OR REPLACE FUNCTION public.referral_code_exists(p_referral_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_referral_code IS NULL OR BTRIM(p_referral_code) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.usuarios u WHERE u.referral_code = UPPER(BTRIM(p_referral_code))
    UNION ALL
    SELECT 1 FROM public.business b WHERE b.referral_code = UPPER(BTRIM(p_referral_code))
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.referral_code_exists(TEXT)
IS 'Retorna true si el referral_code existe en usuarios o business';

-- =====================================================
-- Fin de migración
-- =====================================================
