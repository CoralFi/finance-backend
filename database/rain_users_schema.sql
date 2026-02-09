-- =============================================
-- Rain Users Schema
-- Stores Rain customer information
-- Connected to usuarios table via customer_id
-- =============================================

-- First, add UNIQUE constraint to usuarios.customer_id if not exists
ALTER TABLE public.usuarios
ADD CONSTRAINT usuarios_customer_id_unique UNIQUE (customer_id);

-- Create enum for application status
CREATE TYPE rain_application_status AS ENUM (
    'needsVerification',
    'pending',
    'approved',
    'rejected',
    'inReview'
);

-- Create rain_users table
CREATE TABLE IF NOT EXISTS public.rain_users (
    -- Primary key (Rain user ID)
    rain_user_id UUID PRIMARY KEY,

-- Foreign key to usuarios table
customer_id UUID NOT NULL REFERENCES public.usuarios (customer_id) ON DELETE CASCADE,

-- Status flags (Rain specific)
is_active BOOLEAN DEFAULT false,
is_terms_of_service_accepted BOOLEAN DEFAULT false,

-- Address from Rain (stored as JSONB for flexibility)
address JSONB,
-- Expected structure:
-- {
--   "line1": "123 Main St",
--   "city": "Miami",
--   "region": "FL",
--   "postalCode": "33101",
--   "countryCode": "US"
-- }

-- Phone information from Rain
phone_country_code TEXT, phone_number TEXT,

-- Application status
application_status rain_application_status DEFAULT 'needsVerification',

-- Application links (stored as JSONB)
application_external_verification_link JSONB,
-- Expected structure:
-- {
--   "url": "https://use-dev.rain.xyz/kyc",
--   "params": {
--     "userId": "uuid",
--     "signature": "signature_string"
--   }
-- }
application_completion_link JSONB,
-- Expected structure:
-- {
--   "url": "https://use-dev.rain.xyz/kyc",
--   "params": {
--     "userId": "uuid",
--     "signature": "signature_string"
--   }
-- }

-- Application reason
application_reason TEXT,

-- Timestamps
created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on customer_id for faster lookups
CREATE INDEX idx_rain_users_customer_id ON public.rain_users (customer_id);

-- Create index on application_status for filtering
CREATE INDEX idx_rain_users_application_status ON public.rain_users (application_status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rain_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rain_users_updated_at
    BEFORE UPDATE ON public.rain_users
    FOR EACH ROW
    EXECUTE FUNCTION update_rain_users_updated_at();

-- Enable Row Level Security
ALTER TABLE public.rain_users ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage all data
CREATE POLICY "Service role can manage all rain_users" ON public.rain_users FOR ALL USING (auth.role () = 'service_role')
WITH
    CHECK (auth.role () = 'service_role');

-- Grant permissions
GRANT
SELECT, INSERT,
UPDATE, DELETE ON public.rain_users TO authenticated;

GRANT ALL ON public.rain_users TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.rain_users IS 'Stores Rain payment platform customer information';

COMMENT ON COLUMN public.rain_users.rain_user_id IS 'Rain user UUID from Rain API (primary key)';

COMMENT ON COLUMN public.rain_users.customer_id IS 'Foreign key reference to usuarios table';

COMMENT ON COLUMN public.rain_users.address IS 'Customer address as JSONB (line1, city, region, postalCode, countryCode)';

COMMENT ON COLUMN public.rain_users.application_external_verification_link IS 'External KYC verification link with URL and params';

COMMENT ON COLUMN public.rain_users.application_completion_link IS 'KYC completion link with URL and params';