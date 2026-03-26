-- Active: 1761318682358@@aws-0-sa-east-1.pooler.supabase.com@5432@postgres@public
-- Active: 1761318682358@@aws-0-sa-east-1.pooler.supabase.com@5432@postgres
-- =====================================================
-- Rain Companies Schema
-- Guarda registro de empresas para onboarding en Rain
-- =====================================================

-- Tabla principal de empresas
CREATE TABLE IF NOT EXISTS public.rain_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación opcional con usuario interno (si aplica en tu flujo)
  customer_id UUID REFERENCES public.usuarios(customer_id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.usuarios(business_id) ON DELETE SET NULL,

  -- Identificador remoto en Rain (cuando exista)
  rain_company_id TEXT UNIQUE,

  -- Datos principales del payload
  name TEXT NOT NULL,

  -- Address raíz del payload
  address JSONB NOT NULL,
  -- Ejemplo:
  -- {
  --   "line1":"Av. Reforma 500",
  --   "city":"Ciudad de México",
  --   "region":"CDMX",
  --   "postalCode":"06600",
  --   "countryCode":"MX",
  --   "country":"Mexico"
  -- }

  -- entity
  entity_name TEXT NOT NULL,
  entity_description TEXT,
  entity_industry TEXT,
  entity_registration_number TEXT,
  entity_tax_id TEXT,
  entity_website TEXT,
  entity_type TEXT,

  -- initialUser (1:1 con la empresa)
  initial_user_first_name TEXT,
  initial_user_last_name TEXT,
  initial_user_birth_date DATE,
  initial_user_national_id TEXT,
  initial_user_country_of_issue TEXT,
  initial_user_email TEXT,
  initial_user_address JSONB,
  initial_user_ip_address INET,
  initial_user_wallet_address TEXT,
  initial_user_solana_address TEXT,
  initial_user_chain_id TEXT,
  private_key TEXT,
  solana_key TEXT,

  -- Para trazabilidad/debug
  registration_payload JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'error')),
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibilidad para bases ya creadas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rain_companies'
      AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.rain_companies DROP COLUMN customer_id;
  END IF;
END $$;

ALTER TABLE public.rain_companies
  ADD COLUMN IF NOT EXISTS private_key TEXT;

ALTER TABLE public.rain_companies
  ADD COLUMN IF NOT EXISTS solana_key TEXT;

COMMENT ON TABLE public.rain_companies IS 'Registro de empresas para onboarding en Rain';
COMMENT ON COLUMN public.rain_companies.address IS 'Dirección de empresa en formato JSONB';
COMMENT ON COLUMN public.rain_companies.initial_user_address IS 'Dirección de initialUser en formato JSONB';
COMMENT ON COLUMN public.rain_companies.business_id IS 'Referencia al business_id en tabla usuarios';
COMMENT ON COLUMN public.rain_companies.private_key IS 'Clave privada EVM asociada al onboarding de la empresa';
COMMENT ON COLUMN public.rain_companies.solana_key IS 'Clave privada/base64 de Solana asociada al onboarding de la empresa';
COMMENT ON COLUMN public.rain_companies.registration_payload IS 'Payload completo enviado a Rain para auditoría/reproceso';

-- =====================================================
-- Representantes legales
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rain_company_representatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rain_company_uuid UUID NOT NULL REFERENCES public.rain_companies(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  email TEXT,
  national_id TEXT,
  country_of_issue TEXT,
  address JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.rain_company_representatives IS 'Representantes de empresas registradas en Rain';

-- =====================================================
-- UBOs (Ultimate Beneficial Owners)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rain_company_ubos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rain_company_uuid UUID NOT NULL REFERENCES public.rain_companies(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  email TEXT,
  national_id TEXT,
  country_of_issue TEXT,
  address JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.rain_company_ubos IS 'Ultimate Beneficial Owners de empresas registradas en Rain';

-- =====================================================
-- Índices
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_rain_companies_customer_id
  ON public.rain_companies(customer_id);

CREATE INDEX IF NOT EXISTS idx_rain_companies_business_id
  ON public.rain_companies(business_id);

CREATE INDEX IF NOT EXISTS idx_rain_companies_rain_company_id
  ON public.rain_companies(rain_company_id);

CREATE INDEX IF NOT EXISTS idx_rain_companies_status
  ON public.rain_companies(status);

CREATE INDEX IF NOT EXISTS idx_rain_companies_created_at
  ON public.rain_companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rain_companies_entity_tax_id
  ON public.rain_companies(entity_tax_id);

CREATE INDEX IF NOT EXISTS idx_rain_companies_initial_user_email
  ON public.rain_companies(initial_user_email);

CREATE INDEX IF NOT EXISTS idx_rain_companies_payload_gin
  ON public.rain_companies USING GIN (registration_payload);

CREATE INDEX IF NOT EXISTS idx_rain_company_reps_company
  ON public.rain_company_representatives(rain_company_uuid);

CREATE INDEX IF NOT EXISTS idx_rain_company_reps_email
  ON public.rain_company_representatives(email);

CREATE INDEX IF NOT EXISTS idx_rain_company_ubos_company
  ON public.rain_company_ubos(rain_company_uuid);

CREATE INDEX IF NOT EXISTS idx_rain_company_ubos_email
  ON public.rain_company_ubos(email);

-- =====================================================
-- Triggers updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_rain_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_rain_companies_updated_at ON public.rain_companies;
CREATE TRIGGER trigger_rain_companies_updated_at
  BEFORE UPDATE ON public.rain_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rain_companies_updated_at();

DROP TRIGGER IF EXISTS trigger_rain_company_representatives_updated_at ON public.rain_company_representatives;
CREATE TRIGGER trigger_rain_company_representatives_updated_at
  BEFORE UPDATE ON public.rain_company_representatives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rain_companies_updated_at();

DROP TRIGGER IF EXISTS trigger_rain_company_ubos_updated_at ON public.rain_company_ubos;
CREATE TRIGGER trigger_rain_company_ubos_updated_at
  BEFORE UPDATE ON public.rain_company_ubos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rain_companies_updated_at();

-- =====================================================
-- RLS (recomendado: solo backend/service_role)
-- =====================================================
ALTER TABLE public.rain_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rain_company_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rain_company_ubos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rain_companies"
  ON public.rain_companies
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage rain_company_representatives"
  ON public.rain_company_representatives
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can manage rain_company_ubos"
  ON public.rain_company_ubos
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grants
GRANT ALL ON public.rain_companies TO service_role;
GRANT ALL ON public.rain_company_representatives TO service_role;
GRANT ALL ON public.rain_company_ubos TO service_role;
