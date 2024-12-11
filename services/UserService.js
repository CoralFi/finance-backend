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
        const { data, error } = await this.supabase.from("usuarios").insert([
            {
                email: user.email,
                password: user.password,
                nombre: user.nombre,
                apellido: user.apellido,
                user_type: user.user_type,
            },
        ]).select('user_id');
        
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
}

export default UserService;
