import UserService from "../../../services/UserService.js";
import { createFernCustomer } from "../../../services/fern/Customer.js";
import bcrypt from 'bcrypt';
import supabase from "../supabase.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { email, password, nombre, apellido, userType, tosCoral, businessName } = req.body;
        const userService = new UserService();

        if (!email || !password || !nombre || !apellido || !userType) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        try {
            await supabase.rpc('begin');
        
            // Verificar si el usuario ya existe
            const verifyUser = await userService.verifyUser(email, res);
            if (verifyUser) {
                await supabase.rpc('rollback');
                return res.status(400).json({ message: "El usuario ya existe." });
            }
        
            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
        
            // Crear el usuario en la base de datos
            const newUser = await userService.createUser({
                email,
                password: hashedPassword,
                nombre,
                apellido,
                userType,
                tosCoral,
            });
        
            // Crear cliente en Fern
            try {
                const fernCustomer = await createFernCustomer({
                    user_id: newUser.user_id,
                    customerType: newUser.user_type,
                    email: newUser.email,
                    firstName: newUser.nombre,
                    lastName: newUser.apellido,
                    businessName: businessName,
                });
        
                await supabase.rpc('commit');
                return res.status(200).json({ 
                    message: "Usuario creado exitosamente.", 
                    user_id: newUser.user_id,
                    name: newUser.nombre,
                    lastName: newUser.apellido,
                    userType: newUser.user_type,
                    email: newUser.email,
                    fernCustomerId: fernCustomer.fernCustomerId,
                    fernWalletId: fernCustomer.fernWalletId,
                    KycFern: fernCustomer.Kyc,
                    KycLinkFern: fernCustomer.KycLink,
                    tosCoral: newUser.tos_coral,
                });
        
            } catch (fernError) {
                console.error('Error en createFernCustomer:', fernError);
                await supabase.rpc('rollback');
                //await userService.deleteUser(newUser.user_id);
                throw fernError;
            }
        
        } catch (error) {
            try {
                await supabase.rpc('rollback');
            } catch (rollbackError) {
                console.error('Error al hacer rollback:', rollbackError);
            }
            
            console.error("Error al crear el usuario:", error);
            return res.status(500).json({ 
                message: "Error al crear el usuario.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}