import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import CustomerService from "../../services/sphere/CustomerService.js";  

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Responde con HTTP 200 OK
    }

    if (req.method === 'GET') {
        try {
            const { user_id } = req.query;

            const customerService = new CustomerService();

            // Buscar al usuario en la base de datos por email
            const { data: user, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("user_id", user_id)
                .single();

            if (error || !user) {
                return res.status(400).json({ message: "Usuario no encontrado." });
            }

            const tosEur = await customerService.getWallet(user.customer_id);
            const updateTosEur = user.tos_eur;
            const needTosEur = tosEur === "approved" ? "approved" : updateTosEur === "pending" ? "pending" : "incomplete";

            res.status(200).json({
                message: "Información del usuario: ",
                user: {
                    id: user.user_id,
                    email: user.email,
                    firstName: user.nombre,
                    lastName: user.apellido,
                    userType: user.user_type,
                    kyc: user.estado_kyc ,
                    wallet: user.wallet_id,
                    google_auth: user.qr_code ? true : false,
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
