import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import CustomerService from "../../services/sphere/CustomerService.js";  

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
            const customerService = new CustomerService();

            // Buscar al usuario en la base de datos por email
            const { data: user, error } = await supabase
                .from("usuarios")
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

            const tosEur = await customerService.getTosEur(user.customer_id);
            const updateTosEur = user.tos_eur;
            const needTosEur = tosEur === "approved" ? "approved" : updateTosEur === "pending" ? "pending" : "incomplete";

            res.status(200).json({
                message: "Inicio de sesión exitoso.",
                user: {
                    id: user.user_id,
                    email: user.email,
                    firstName: user.nombre,
                    lastName: user.apellido,
                    userType: user.user_type,
                    kyc: user.estado_kyc ,
                    wallet: user.wallet_id,
                    google_auth: user.google_auth,
                    customerFiat: user.customer_id,
                    tos: user.tos_coral,
                    qr_payment: user.qr_payment,
                    tos_eur: needTosEur,
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
