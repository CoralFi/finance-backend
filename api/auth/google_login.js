import { OAuth2Client } from "google-auth-library";
import UserBO from "../../models/user.js";
import UserService from "../../services/UserService.js";
import WalletService from "../../services/utila/WalletService.js";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*"); // TODO: cambiar por la del front
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === 'POST') {

        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ message: "Token de Google es obligatorio" });
            }

            const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
            const payload = ticket.getPayload();
            const { email, name, sub } = payload;

            if (!email || !name) {
                return res.status(400).json({ message: "El token no contiene información suficiente" });
            }

            // Buscar si el usuario ya existe en la base de datos
            const { data: existingUser, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("email", email)
                .single();

            const userService = new UserService();
            const walletService = new WalletService();

            if (existingUser) {
                // Lógica de login
                res.status(200).json({
                    message: "Inicio de sesión exitoso.",
                    user: {
                        id: existingUser.user_id,
                        email: existingUser.email,
                        firstName: existingUser.nombre,
                        lastName: existingUser.apellido,
                        userType: existingUser.user_type,
                        kyc: existingUser.estado_kyc,
                        wallet: existingUser.wallet_id,
                    },
                });
            } else {
                // Lógica de signup
                const user = new UserBO(email, null, name, null, "persona");
                const createUser = await userService.createUser(user, res);

                // Asociar una wallet al nuevo usuario
                await walletService.createWallet(createUser);

                // Actualizar Supabase con el estado de validación
                const { error: supabaseError } = await supabase
                    .from("usuarios")
                    .update({ validated: true })
                    .eq("email", email);

                if (supabaseError) {
                    throw new Error("Error al actualizar el estado del usuario en Supabase.");
                }

                res.status(201).json({ message: "Usuario registrado exitosamente con Google." });
            }
        } catch (error) {
            console.error("Error en Google Login:", error);
            res.status(500).json({ message: "Error al realizar el login con Google", error: error.message });
        }
    }
}
