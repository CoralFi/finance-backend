import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { email, currentPassword, newPassword } = req.body;

        // Validar campos requeridos
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: "Email, contraseña actual y nueva contraseña son obligatorios." 
            });
        }

        // Validar longitud de nueva contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "La nueva contraseña debe tener al menos 6 caracteres." 
            });
        }

        // Validar que la nueva contraseña sea diferente a la actual
        if (currentPassword === newPassword) {
            return res.status(400).json({ 
                success: false,
                message: "La nueva contraseña debe ser diferente a la actual." 
            });
        }

        try {
            // Buscar al usuario en la base de datos por email
            const { data: user, error: fetchError } = await supabase
                .from("usuarios")
                .select("user_id, email, password")
                .eq("email", email)
                .single();

            if (fetchError || !user) {
                return res.status(404).json({ 
                    success: false,
                    message: "Usuario no encontrado." 
                });
            }

            // Verificar la contraseña actual
            const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidCurrentPassword) {
                return res.status(401).json({ 
                    success: false,
                    message: "La contraseña actual es incorrecta." 
                });
            }

            // Encriptar la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña en la base de datos
            const { error: updateError } = await supabase
                .from("usuarios")
                .update({ password: hashedNewPassword })
                .eq("user_id", user.user_id);

            if (updateError) {
                throw new Error("Error al actualizar la contraseña en la base de datos.");
            }

            // Respuesta exitosa
            res.status(200).json({
                success: true,
                message: "Contraseña cambiada exitosamente.",
                data: {
                    userId: user.user_id,
                    email: user.email,
                    updatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            res.status(500).json({ 
                success: false,
                message: "Error interno del servidor.", 
                error: error.message 
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({
            success: false,
            message: `Método ${req.method} no permitido`
        });
    }
}
