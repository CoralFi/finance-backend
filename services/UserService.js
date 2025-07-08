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
        return existingUser;
    }

    async createUser(user) {
        console.log("Creating user with data:", user);
        let createdUserId = null;


        try {
            // Usar una transacción para asegurar consistencia de datos
            const { data: userData, error: userError } = await this.supabase
                .from("usuarios")
                .insert({
                    email: user.email,
                    password: user.password,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    user_type: user.userType,
                    tos_coral: user.tosCoral
                })
                .select('user_id, email, nombre, apellido, user_type, tos_coral')
                .single(); 

            if (userError) {
                console.error("Error creating user:", userError);
                throw new Error(`Error al crear el usuario: ${userError.message}`);
            }

            createdUserId = userData.user_id;
            // Insertar user_info 
            const { data: userInfoData, error: userInfoError } = await this.supabase
                .from("user_info")
                .insert({
                    user_id: userData.user_id,
                    phone_number: user.phoneNumber,
                    birthdate: user.birthDate,
                    occupation_id: user.recentOccupation,
                    employment_situation: user.employmentStatus,
                    account_purposes_id: user.accountPurpose,
                    source_fund_id: user.fundsOrigin,
                    amount_to_moved: user.expectedAmount,
                })
                .select('user_id, phone_number, birthdate, occupation_id, employment_situation, account_purposes_id, source_fund_id, amount_to_moved')
                .single();

            if (userInfoError) {
                console.error("Error creating user_info:", userInfoError);
                await this.rollbackUser(createdUserId);
                throw new Error(`Error al crear la información del usuario: ${userInfoError.message}`);
            }

            // Combinar los datos en un solo objeto
            const completeUserData = {
                ...userData,
                ...userInfoData
            };

            console.log("User created successfully:", completeUserData);
            return completeUserData;

        } catch (error) {
            console.error("Error in createUser:", error);
            await this.rollbackUser(createdUserId);
            throw error;
        }
    }

    // Función helper para rollback
async rollbackUser(userId) {
    try {
        console.log(`Rolling back user creation for user_id: ${userId}`);
        
        // Eliminar user_info si existe
        await this.supabase
            .from("user_info")
            .delete()
            .eq('user_id', userId);
        
        // Eliminar usuario
        await this.supabase
            .from("usuarios")
            .delete()
            .eq('user_id', userId);
            
        console.log(`Rollback completed for user_id: ${userId}`);
    } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
    }
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
