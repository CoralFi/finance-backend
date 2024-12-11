import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
    // Atributo estático para almacenar la única instancia
    static instance = null;

    constructor() {
        if (SupabaseClient.instance) {
            return SupabaseClient.instance; // Si ya existe, devuelve la instancia
        }

        // Configuración de Supabase
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseKey = process.env.SUPABASE_KEY;
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

        SupabaseClient.instance = this; // Guarda la instancia
    }

    // Método para acceder al cliente de Supabase
    getClient() {
        return this.supabase;
    }
}

export default SupabaseClient;
