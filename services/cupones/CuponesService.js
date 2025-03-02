import SupabaseClient from "../../database/client.js";

class CuponesService {
    constructor() {
        this.supabase = new SupabaseClient().getClient();
    }

    async getComision(value) {
        const data = await this.supabase
        .from('cupones')
        .select('*')
        .eq('value', value)
        .single()

        console.log("comision:", data)

        if(data.error !== null) {
            throw new Error("Cupon invalido.");
        }

        return data.data.comision;

    }
}

export default CuponesService;
