import { OAuth2Client } from "google-auth-library";
import UserBO from "../../models/user.js";
import UserService from "../../services/UserService.js";
import WalletService from "../../services/utila/WalletService.js";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
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

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ message: "Token de Google es obligatorio" });
            }

            const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
            if (!ticket) {
                return res.status(400).json({ message: "Token de Google no válido" });
            }
            
            const payload = ticket.getPayload();
            if (!payload || !payload.email || !payload.name) {
                return res.status(400).json({ message: "El token no contiene información suficiente" });
            }

            if (!payload) {
                return res.status(400).json({ message: "El token de Google no contiene datos válidos" });
            }

            const { email, name } = payload;

            if (!email || !name) {
                return res.status(400).json({ message: "El token no contiene información suficiente" });
            }

            const { data: existingUser, error } = await supabase
                .from("usuarios")
                .select("*")
                .eq("email", email)
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error("Error en la consulta de Supabase:", error);
                return res.status(500).json({ message: "Error en la base de datos", error: error.message });
            }

            if (existingUser) {
                console.log("Usuario existente encontrado:", existingUser);
                return res.status(200).json({
                    message: "Inicio de sesión exitoso.",
                    user: {
                        id: existingUser.user_id,
                        email: existingUser.email,
                        firstName: existingUser.nombre,
                        lastName: existingUser.apellido,
                        userType: existingUser.user_type,
                        kyc: existingUser.estado_kyc,
                        wallet: existingUser.wallet_id,
                        google_auth: existingUser.google_auth,
                        customerFiat: existingUser.customer_id,
                        tos: existingUser.tos_coral,
                        tos_eur: existingUser.tos_eur,
                    },
                });
            } else {
                console.log("El usuario no existe en la base de datos. Procediendo con el registro.");
                console.log("email", email);
                console.log("name", name);
                const userService = new UserService();
                const walletService = new WalletService();

                const nameSplit = name.split(" ");
                const firstName = nameSplit[0];
                const lastName = nameSplit.slice(1).join(" ");

                const randomPassword = crypto.randomBytes(16).toString('hex');

                const user = new UserBO(email, randomPassword, firstName, lastName, "persona", true);
                const userId = await userService.createUser(user);

                if (!userId) {
                    throw new Error("Error al crear el usuario.");
                }

                await walletService.createWallet(userId);

                // Get the newly created user to include in the response
                const { data: newUser, error: fetchError } = await supabase
                    .from("usuarios")
                    .select("*")
                    .eq("user_id", userId)
                    .single();

                if (fetchError) {
                    throw new Error("Error al obtener el usuario recién creado.");
                }

                const { error: supabaseError } = await supabase
                    .from("usuarios")
                    .update({ validated: true })
                    .eq("email", email);

                if (supabaseError) {
                    throw new Error("Error al actualizar el estado del usuario en Supabase.");
                }

                res.status(201).json({ 
                    message: "Usuario registrado exitosamente con Google.",
                    user: {
                        id: userId,
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        userType: "persona",
                        kyc: "incomplete",
                        wallet: newUser.wallet_id,
                        google_auth: newUser.google_auth,
                        customerFiat: newUser.customer_id,
                        tos: newUser.tos_coral,
                        tos_eur: newUser.tos_eur,
                    },
                });
            }
        } catch (error) {
            console.error("Error en Google Login:", error);
            res.status(500).json({ message: "Error al realizar el login con Google", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Método no permitido" });
    }
}

