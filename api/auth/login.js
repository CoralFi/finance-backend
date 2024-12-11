import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Responde con HTTP 200 OK
    }

    if (req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son obligatorios." });
        }

        try {
            // Buscar al usuario en la base de datos por email
            const { data: user, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (error || !user) {
                return res.status(400).json({ message: "Usuario no encontrado." });
            }

            // Comparar la contraseña ingresada con la almacenada
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ message: "Contraseña incorrecta." });
            }

            //TODO: generar logica para mantener iniciada la session

            res.status(200).json({
                message: "Inicio de sesión exitoso.",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    userType: user.user_type,
                },
            });
        } catch (error) {
            res.status(500).json({ message: "Error en el servidor.", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
