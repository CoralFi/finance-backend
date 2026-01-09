import supabase from "@/db/supabase";


export const getCustomerInfo = async (customerId: string) => {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('customer_id', customerId)
        .single();

    if (error) {
        console.error('Error fetching customer info:', error);
        throw error;
    }

    return data;
};

export const getCustomerIDFromFernCustomerID = async (ferncustomerId: string) => {
    const { data, error } = await supabase
        .from('fern_customer')
        .select(`
            user_id,
            usuarios!inner(customer_id)
        `)
        .eq('fernCustomerId', ferncustomerId)
        .single();

    if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    if (!data?.usuarios) {
        throw new Error(`DATABASE_ERROR: Customer not found for fernCustomerId: ${ferncustomerId}`);
    }

    // Supabase returns the joined table as an object when using .single()
    const usuarios = data.usuarios as unknown as { customer_id: string };
    return usuarios.customer_id;
}

/**
 * Get all customer ID mappings from fernCustomerId to internal customer_id
 * Returns a Map for O(1) lookup when processing multiple customers
 */
export const getAllCustomerIDMappings = async (): Promise<Map<string, string>> => {
    const { data, error } = await supabase
        .from('fern')
        .select(`
            fernCustomerId,
            usuarios!inner(customer_id)
        `);

    if (error) {
        throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    const mappings = new Map<string, string>();

    if (data) {
        for (const record of data) {
            const usuarios = record.usuarios as unknown as { customer_id: string };
            if (record.fernCustomerId && usuarios?.customer_id) {
                mappings.set(record.fernCustomerId, usuarios.customer_id);
            }
        }
    }

    return mappings;
}
