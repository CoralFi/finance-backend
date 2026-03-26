export interface RainAddress {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
    country?: string;
}

export type RainCompanyStatus =
    | "pending"
    | "submitted"
    | "approved"
    | "rejected"
    | "error";

export interface RainCompany {
    id: string;
    customer_id: string | null;
    business_id: string | null;
    rain_company_id: string | null;
    name: string;
    address: RainAddress;
    entity_name: string;
    entity_description: string | null;
    entity_industry: string | null;
    entity_registration_number: string | null;
    entity_tax_id: string | null;
    entity_website: string | null;
    entity_type: string | null;
    initial_user_first_name: string | null;
    initial_user_last_name: string | null;
    initial_user_birth_date: string | null;
    initial_user_national_id: string | null;
    initial_user_country_of_issue: string | null;
    initial_user_email: string | null;
    initial_user_address: RainAddress | null;
    initial_user_ip_address: string | null;
    initial_user_wallet_address: string | null;
    initial_user_solana_address: string | null;
    initial_user_chain_id: string | null;
    private_key: string | null;
    solana_key: string | null;
    registration_payload: Record<string, unknown> | null;
    status: RainCompanyStatus;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface CreateRainCompanyInput {
    customer_id?: string | null;
    business_id?: string | null;
    rain_company_id?: string | null;
    name: string;
    address: RainAddress;
    entity_name: string;
    entity_description?: string | null;
    entity_industry?: string | null;
    entity_registration_number?: string | null;
    entity_tax_id?: string | null;
    entity_website?: string | null;
    entity_type?: string | null;
    initial_user_first_name?: string | null;
    initial_user_last_name?: string | null;
    initial_user_birth_date?: string | null;
    initial_user_national_id?: string | null;
    initial_user_country_of_issue?: string | null;
    initial_user_email?: string | null;
    initial_user_address?: RainAddress | null;
    initial_user_ip_address?: string | null;
    initial_user_wallet_address?: string | null;
    initial_user_solana_address?: string | null;
    initial_user_chain_id?: string | null;
    private_key?: string | null;
    solana_key?: string | null;
    registration_payload?: Record<string, unknown> | null;
    status?: RainCompanyStatus;
    metadata?: Record<string, unknown> | null;
}

export type UpdateRainCompanyInput = Partial<CreateRainCompanyInput>;

export interface RainCompanyRepresentative {
    id: string;
    rain_company_uuid: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    email: string | null;
    national_id: string | null;
    country_of_issue: string | null;
    address: RainAddress | null;
    created_at: string;
    updated_at: string;
}

export interface CreateRainCompanyRepresentativeInput {
    first_name: string;
    last_name: string;
    birth_date?: string | null;
    email?: string | null;
    national_id?: string | null;
    country_of_issue?: string | null;
    address?: RainAddress | null;
}

export interface RainCompanyUbo {
    id: string;
    rain_company_uuid: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    email: string | null;
    national_id: string | null;
    country_of_issue: string | null;
    address: RainAddress | null;
    created_at: string;
    updated_at: string;
}

export interface CreateRainCompanyUboInput {
    first_name: string;
    last_name: string;
    birth_date?: string | null;
    email?: string | null;
    national_id?: string | null;
    country_of_issue?: string | null;
    address?: RainAddress | null;
}

export interface RainCompaniesFilters {
    customer_id?: string;
    business_id?: string;
    status?: RainCompanyStatus;
    rain_company_id?: string;
    limit?: number;
}

export interface CreateRainCompanyWithContactsInput {
    company: CreateRainCompanyInput;
    representatives?: CreateRainCompanyRepresentativeInput[];
    ubos?: CreateRainCompanyUboInput[];
}

export interface RainCompanyFullRecord {
    company: RainCompany;
    representatives: RainCompanyRepresentative[];
    ubos: RainCompanyUbo[];
}
