import supabase from "@/db/supabase";
import {
    RainCompany,
    CreateRainCompanyInput,
    UpdateRainCompanyInput,
    RainCompanyRepresentative,
    CreateRainCompanyRepresentativeInput,
    RainCompanyUbo,
    CreateRainCompanyUboInput,
    RainCompaniesFilters,
    CreateRainCompanyWithContactsInput,
    RainCompanyFullRecord,
} from "@/services/types/rainCompanies.types";

export * from "@/services/types/rainCompanies.types";

const RAIN_COMPANIES_TABLE = "rain_companies";
const RAIN_COMPANY_REPRESENTATIVES_TABLE = "rain_company_representatives";
const RAIN_COMPANY_UBOS_TABLE = "rain_company_ubos";

// ==================== CREATE ====================

export const createRainCompany = async (
    input: CreateRainCompanyInput
): Promise<RainCompany> => {
    if (!input.name || !input.entity_name || !input.address) {
        throw new Error("name, entity_name and address are required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error("Error creating rain company:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const getRainCompanyByCustomerId = async (
    customerId: string
): Promise<RainCompany | null> => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching rain company by customer_id:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const getRainCompanyByBusinessId = async (
    businessId: string
): Promise<RainCompany | null> => {
    if (!businessId) {
        throw new Error("businessId is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching rain company by business_id:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const createRainCompanyWithContacts = async (
    input: CreateRainCompanyWithContactsInput
): Promise<RainCompanyFullRecord> => {
    const company = await createRainCompany(input.company);

    const representatives = input.representatives?.length
        ? await addRainCompanyRepresentatives(company.id, input.representatives)
        : [];

    const ubos = input.ubos?.length
        ? await addRainCompanyUbos(company.id, input.ubos)
        : [];

    return {
        company,
        representatives,
        ubos,
    };
};

export const addRainCompanyRepresentative = async (
    rainCompanyId: string,
    input: CreateRainCompanyRepresentativeInput
): Promise<RainCompanyRepresentative> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    if (!input.first_name || !input.last_name) {
        throw new Error("first_name and last_name are required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANY_REPRESENTATIVES_TABLE)
        .insert({
            rain_company_uuid: rainCompanyId,
            ...input,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating rain company representative:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const addRainCompanyRepresentatives = async (
    rainCompanyId: string,
    inputs: CreateRainCompanyRepresentativeInput[]
): Promise<RainCompanyRepresentative[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    if (!inputs.length) {
        return [];
    }

    const payload = inputs.map((item) => ({
        rain_company_uuid: rainCompanyId,
        ...item,
    }));

    const { data, error } = await supabase
        .from(RAIN_COMPANY_REPRESENTATIVES_TABLE)
        .insert(payload)
        .select();

    if (error) {
        console.error("Error creating rain company representatives:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

export const addRainCompanyUbo = async (
    rainCompanyId: string,
    input: CreateRainCompanyUboInput
): Promise<RainCompanyUbo> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    if (!input.first_name || !input.last_name) {
        throw new Error("first_name and last_name are required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANY_UBOS_TABLE)
        .insert({
            rain_company_uuid: rainCompanyId,
            ...input,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating rain company UBO:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const addRainCompanyUbos = async (
    rainCompanyId: string,
    inputs: CreateRainCompanyUboInput[]
): Promise<RainCompanyUbo[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    if (!inputs.length) {
        return [];
    }

    const payload = inputs.map((item) => ({
        rain_company_uuid: rainCompanyId,
        ...item,
    }));

    const { data, error } = await supabase
        .from(RAIN_COMPANY_UBOS_TABLE)
        .insert(payload)
        .select();

    if (error) {
        console.error("Error creating rain company UBOs:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

// ==================== READ ====================

export const getRainCompanyById = async (id: string): Promise<RainCompany | null> => {
    if (!id) {
        throw new Error("id is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching rain company by id:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const getRainCompanyByRainCompanyId = async (
    rainCompanyId: string
): Promise<RainCompany | null> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .select("*")
        .eq("rain_company_id", rainCompanyId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching rain company by rain_company_id:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const listRainCompanies = async (
    filters?: RainCompaniesFilters
): Promise<RainCompany[]> => {
    let query = supabase
        .from(RAIN_COMPANIES_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

    if (filters?.customer_id) {
        query = query.eq("customer_id", filters.customer_id);
    }

    if (filters?.status) {
        query = query.eq("status", filters.status);
    }

    if (filters?.rain_company_id) {
        query = query.eq("rain_company_id", filters.rain_company_id);
    }

    if (filters?.limit && filters.limit > 0) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error listing rain companies:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

export const getRainCompanyRepresentatives = async (
    rainCompanyId: string
): Promise<RainCompanyRepresentative[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANY_REPRESENTATIVES_TABLE)
        .select("*")
        .eq("rain_company_uuid", rainCompanyId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching rain company representatives:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

export const getRainCompanyUbos = async (
    rainCompanyId: string
): Promise<RainCompanyUbo[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANY_UBOS_TABLE)
        .select("*")
        .eq("rain_company_uuid", rainCompanyId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching rain company UBOs:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

export const getRainCompanyFullById = async (
    rainCompanyId: string
): Promise<RainCompanyFullRecord | null> => {
    const company = await getRainCompanyById(rainCompanyId);

    if (!company) {
        return null;
    }

    const [representatives, ubos] = await Promise.all([
        getRainCompanyRepresentatives(rainCompanyId),
        getRainCompanyUbos(rainCompanyId),
    ]);

    return {
        company,
        representatives,
        ubos,
    };
};

 
// ==================== UPDATE ====================

export const updateRainCompany = async (
    rainCompanyId: string,
    input: UpdateRainCompanyInput
): Promise<RainCompany> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const existing = await getRainCompanyById(rainCompanyId);
    if (!existing) {
        throw new Error("Rain company not found");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .update(input)
        .eq("id", rainCompanyId)
        .select()
        .single();

    if (error) {
        console.error("Error updating rain company:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

export const replaceRainCompanyRepresentatives = async (
    rainCompanyId: string,
    inputs: CreateRainCompanyRepresentativeInput[]
): Promise<RainCompanyRepresentative[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const { error: deleteError } = await supabase
        .from(RAIN_COMPANY_REPRESENTATIVES_TABLE)
        .delete()
        .eq("rain_company_uuid", rainCompanyId);

    if (deleteError) {
        console.error("Error deleting previous rain company representatives:", deleteError);
        throw new Error(`DATABASE_ERROR: ${deleteError.message}`);
    }

    if (!inputs.length) {
        return [];
    }

    return addRainCompanyRepresentatives(rainCompanyId, inputs);
};

export const replaceRainCompanyUbos = async (
    rainCompanyId: string,
    inputs: CreateRainCompanyUboInput[]
): Promise<RainCompanyUbo[]> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const { error: deleteError } = await supabase
        .from(RAIN_COMPANY_UBOS_TABLE)
        .delete()
        .eq("rain_company_uuid", rainCompanyId);

    if (deleteError) {
        console.error("Error deleting previous rain company UBOs:", deleteError);
        throw new Error(`DATABASE_ERROR: ${deleteError.message}`);
    }

    if (!inputs.length) {
        return [];
    }

    return addRainCompanyUbos(rainCompanyId, inputs);
};

export const upsertRainCompanyByRainCompanyId = async (
    input: CreateRainCompanyInput
): Promise<RainCompany> => {
    if (!input.rain_company_id) {
        throw new Error("rain_company_id is required for upsert");
    }

    if (!input.name || !input.entity_name || !input.address) {
        throw new Error("name, entity_name and address are required");
    }

    const { data, error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .upsert(input, { onConflict: "rain_company_id" })
        .select()
        .single();

    if (error) {
        console.error("Error upserting rain company:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

// ==================== DELETE ====================

export const deleteRainCompany = async (rainCompanyId: string): Promise<void> => {
    if (!rainCompanyId) {
        throw new Error("rainCompanyId is required");
    }

    const existing = await getRainCompanyById(rainCompanyId);
    if (!existing) {
        throw new Error("Rain company not found");
    }

    const { error } = await supabase
        .from(RAIN_COMPANIES_TABLE)
        .delete()
        .eq("id", rainCompanyId);

    if (error) {
        console.error("Error deleting rain company:", error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }
};
