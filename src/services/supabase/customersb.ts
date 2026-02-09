import supabase from "@/db/supabase";
import { getFernWalletCryptoInfo } from "../fern/fernServices";

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

export const getAllCustomerInfo = async (customerId: string) => {
    // First, try to get data from usuarios with LEFT JOINs to fern and rain_users
    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select(`
            customer_id,
            user_id,
            email,
            password,
            nombre,
            apellido,
            user_type,
            verificado_email,
            google_auth,
            tos_coral,
            fern(fernCustomerId, fernWalletId),
            rain_users(rain_user_id)
        `)
        .eq('customer_id', customerId);

    if (userError) {
        console.error('Error fetching user info:', userError);
        throw userError;
    }

    console.log(userData[0]);

    // If user found in usuarios, return mapped data
    if (userData && userData.length > 0) {
        const fernWalletAddress = await getFernWalletCryptoInfo(userData[0].fern[0].fernWalletId);
        const u = userData[0] as any;
        return {
            customer_id: u.customer_id,
            user_id: u.user_id,
            email: u.email,
            password: u.password,
            nombre: u.nombre,
            apellido: u.apellido,
            user_type: u.user_type,
            verificado_email: u.verificado_email,
            google_auth: u.google_auth,
            tos_coral: u.tos_coral,
            conduit_id: null,
            fern_customer_id: u.fern[0].fernCustomerId ?? null,
            fernWalletAddress: fernWalletAddress.fernCryptoWallet.address ?? null,
            rain_id: u.rain_users[0].rain_user_id ?? null,
        };
    }

    // If not found in usuarios, search in business
    const { data: businessData, error: businessError } = await supabase
        .from('business')
        .select(`
            business_id,
            business_email,
            password,
            business_name,
            verificado_email,
            google_auth,
            tos_coral,
            conduit_id
        `)
        .eq('business_id', customerId);

    if (businessError) {
        console.error('Error fetching business info:', businessError);
        throw businessError;
    }

    if (businessData && businessData.length > 0) {
        const bs = businessData[0] as any;
        return {
            customer_id: bs.business_id,
            user_id: null,
            email: bs.business_email,
            password: bs.password,
            nombre: bs.business_name,
            apellido: null,
            user_type: 'business',
            verificado_email: bs.verificado_email,
            google_auth: bs.google_auth,
            tos_coral: bs.tos_coral,
            conduit_id: bs.conduit_id,
            fern_customer_id: null,
            rain_id: null,
        };
    }

    return null;
}