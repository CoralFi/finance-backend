import SupabaseClient from "../client.js";

class validate {
    constructor() {
        this.supabase = new SupabaseClient().getClient();
    }

    async validate(customer_id, info) {
        try {
            const { data, error } = await this.supabase
            .from("customer")
            .select(`${info}`)
            .eq("customer_id", customer_id)
            .single();
            
            return data.tos;
        } catch (error) {
            throw new Error("Error al validar el customer: " + error.message);
        }
        
    }
}

export default validate;