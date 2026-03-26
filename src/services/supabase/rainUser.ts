import supabase from "@/db/supabase";
import {
    RainUser,
    CreateRainUserInput,
    UpdateRainUserInput,
    RainApplicationStatus
} from "@/services/types/rainUser.types";

// Re-export types for convenience
export * from "@/services/types/rainUser.types";

// ==================== CREATE ====================

/**
 * Create a new Rain user
 */
export const createRainUser = async (
    input: CreateRainUserInput
): Promise<RainUser> => {
    if (!input.rain_user_id || !input.customer_id) {
        throw new Error("rain_user_id and customer_id are required");
    }
    const { data: existing, error: findError } = await supabase
        .from('rain_users')
        .select('*')
        .eq('customer_id', input.customer_id)
        .maybeSingle();
    if (findError) {
        console.error('Error checking existing rain user:', findError);
        throw new Error(`DATABASE_ERROR: ${findError.message}`);
    }
    if (existing) {
        return existing;
    }
    const { data, error } = await supabase
        .from('rain_users')
        .insert(input)
        .select()
        .single();

    if (error) {
        console.error('Error creating rain user:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};


// ==================== READ ====================

/**
 * Get all Rain users
 */
export const getAllRainUsers = async (): Promise<RainUser[]> => {
    const { data, error } = await supabase
        .from('rain_users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching rain users:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

/**
 * Get Rain user by Rain User ID (primary key)
 */
export const getRainUserByRainId = async (rainUserId: string): Promise<RainUser | null> => {
    if (!rainUserId) {
        throw new Error("rainUserId is required");
    }

    const { data, error } = await supabase
        .from('rain_users')
        .select('*')
        .eq('rain_user_id', rainUserId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching rain user by rain_user_id:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

/**
 * Get Rain user by Customer ID (from usuarios table)
 */
export const getRainUserByCustomerId = async (customerId: string): Promise<RainUser | null> => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    const { data, error } = await supabase
        .from('rain_users')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching rain user by customer_id:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

/**
 * Get Rain user by ID (auto-detects if it's rain_user_id or customer_id)
 * Tries rain_user_id first, then customer_id
 */
export const getRainUserById = async (id: string): Promise<RainUser | null> => {
    if (!id) {
        throw new Error("id is required");
    }

    // Try rain_user_id first
    let rainUser = await getRainUserByRainId(id);

    // If not found, try customer_id
    if (!rainUser) {
        rainUser = await getRainUserByCustomerId(id);
    }

    return rainUser;
};

/**
 * Get Rain users by application status
 */
export const getRainUsersByStatus = async (status: RainApplicationStatus): Promise<RainUser[]> => {
    const { data, error } = await supabase
        .from('rain_users')
        .select('*')
        .eq('application_status', status)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching rain users by status:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data || [];
};

// ==================== UPDATE ====================

/**
 * Update Rain user by Rain User ID
 */
export const updateRainUser = async (
    rainUserId: string,
    input: UpdateRainUserInput
): Promise<RainUser> => {
    if (!rainUserId) {
        throw new Error("rainUserId is required");
    }

    // Check if exists
    const existing = await getRainUserByRainId(rainUserId);
    if (!existing) {
        throw new Error("Rain user not found");
    }

    const { data, error } = await supabase
        .from('rain_users')
        .update(input)
        .eq('rain_user_id', rainUserId)
        .select()
        .single();

    if (error) {
        console.error('Error updating rain user:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

/**
 * Update Rain user by Customer ID
 */
export const updateRainUserByCustomerId = async (
    customerId: string,
    input: UpdateRainUserInput
): Promise<RainUser> => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    // Check if exists
    const existing = await getRainUserByCustomerId(customerId);
    if (!existing) {
        throw new Error("Rain user not found for this customer");
    }

    const { data, error } = await supabase
        .from('rain_users')
        .update(input)
        .eq('customer_id', customerId)
        .select()
        .single();

    if (error) {
        console.error('Error updating rain user by customer_id:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};

// ==================== DELETE ====================

/**
 * Delete Rain user by Rain User ID
 */
export const deleteRainUser = async (rainUserId: string): Promise<void> => {
    if (!rainUserId) {
        throw new Error("rainUserId is required");
    }

    // Check if exists
    const existing = await getRainUserByRainId(rainUserId);
    if (!existing) {
        throw new Error("Rain user not found");
    }

    const { error } = await supabase
        .from('rain_users')
        .delete()
        .eq('rain_user_id', rainUserId);

    if (error) {
        console.error('Error deleting rain user:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }
};

/**
 * Delete Rain user by Customer ID
 */
export const deleteRainUserByCustomerId = async (customerId: string): Promise<void> => {
    if (!customerId) {
        throw new Error("customerId is required");
    }

    // Check if exists
    const existing = await getRainUserByCustomerId(customerId);
    if (!existing) {
        throw new Error("Rain user not found for this customer");
    }

    const { error } = await supabase
        .from('rain_users')
        .delete()
        .eq('customer_id', customerId);

    if (error) {
        console.error('Error deleting rain user by customer_id:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }
};

// ==================== UPSERT ====================

/**
 * Create or update Rain user (upsert by rain_user_id)
 */
export const upsertRainUser = async (input: CreateRainUserInput): Promise<RainUser> => {
    if (!input.rain_user_id || !input.customer_id) {
        throw new Error("rain_user_id and customer_id are required");
    }

    const { data, error } = await supabase
        .from('rain_users')
        .upsert(input, { onConflict: 'rain_user_id' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting rain user:', error);
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    return data;
};
