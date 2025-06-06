import SupabaseClient from "../database/client.js";

class UserService {
    constructor() {
        this.supabase = new SupabaseClient().getClient();
    }

    // Verificar si el correo ya está registrado
    async verifyUser(email, res) {
        const { data: existingUser } = await this.supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();
        
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }
    }

    // Crear un usuario
    async createUser(user) {
        console.log("Creating user with data:", user);
        const { data, error } = await this.supabase.from("usuarios").insert([
            {
                email: user.email,
                password: user.password,
                nombre: user.nombre,
                apellido: user.apellido,
                user_type: user.user_type,
                tos_coral: user.tos_coral
            },
        ]).select('user_id');
        
        if (error) {
            console.error("Error creating user:", error);
            throw new Error(`Error al crear el usuario: ${error.message}`);
        }
    
        if (!data || data.length === 0) {
            const errorMsg = "No se pudo crear el usuario: Datos de respuesta inválidos";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
    
        console.log("User created successfully:", data[0]);
        return data[0].user_id;
    }

    // Ejemplo: Obtener todos los usuarios
    async getAllUsers() {
        const { data, error } = await this.supabase.from('usuarios').select('*');
        if (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
        return data;
    }

    // Ejemplo: Obtener un usuario por ID
    async getUserByEmail(email) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();
        if (error) {
            console.error('Error fetching user by mail:', error);
            throw error;
        }
        return data;
    }

    async getWalletByCustomer(customer) {
        const { data, error } = await this.supabase
        .from('usuarios')
        .select('wallet_id')
        .eq('customer_id', customer)
        .single();

        if (error) {
            console.error('Error fetching wallet_id by customer:', error);
            throw error;
        }
        return data?.wallet_id;
    }
}

export default UserService;
