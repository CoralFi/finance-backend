import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { email, password, firstName, lastName, userType } = req.body;

    if (!email || !password || !firstName || !lastName || !userType) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        // Verificar si el correo ya está registrado
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario
        const { data, error } = await supabase.from("users").insert([
            {
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                user_type: userType,
            },
        ]);

        if (error) throw error;

        res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
    }
}
