import { OAuth2Client } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";
import { FernKycStatus } from "../../services/fern/kycStatus.js";
import { getFernWalletCryptoInfo } from "../../services/fern/wallets.js";
import CustomerService from "../../services/sphere/CustomerService.js";
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

            const { email, name, given_name, family_name, picture, email_verified, sub } = payload;

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

                // find fern in DB
                const { data: fern } = await supabase
                    .from("fern")
                    .select("*")
                    .eq("user_id", existingUser.user_id)
                    .single();

                existingUser.fern = fern;

                let fernKycStatus = { kycStatus: null, kycLink: null };
                try {
                    if (existingUser.fern?.fernCustomerId) {
                        fernKycStatus = await FernKycStatus(existingUser.fern?.fernCustomerId, existingUser.user_id);
                        if (fernKycStatus?.error) {
                            console.warn("Fern API error during Google login:", fernKycStatus.error);
                        }
                    }
                } catch (fernError) {
                    console.error("Unexpected error with Fern KYC status:", fernError);
                }

                let fernWalletCryptoInfo = null;
                if (existingUser.fern?.fernWalletId) {
                    try {
                        fernWalletCryptoInfo = await getFernWalletCryptoInfo(existingUser.fern?.fernWalletId);
                        if (fernWalletCryptoInfo === null) {
                            console.warn("Fern wallet info not found for wallet ID:", existingUser.fern.fernWalletId);
                        }
                    } catch (walletError) {
                        console.error("Error retrieving Fern wallet info:", walletError);
                    }
                }

                // user_info flag
                const { data: user_info_data, error: user_info_error } = await supabase.rpc("user_info_exists", {
                    p_user_id: existingUser.user_id,
                });
                if (user_info_error) {
                    console.error("Error checking user info:", user_info_error);
                }

                // tos_eur computation
                const customerService = new CustomerService();
                let needTosEur = "incomplete";
                try {
                    const tosEur = await customerService.getTosEur(existingUser.customer_id);
                    const updateTosEur = existingUser.tos_eur;
                    needTosEur = tosEur === "approved" ? "approved" : updateTosEur === "pending" ? "pending" : "incomplete";
                } catch (tosErr) {
                    console.error("Error retrieving tos_eur status:", tosErr);
                    needTosEur = existingUser.tos_eur || "incomplete";
                }

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
                        verificado_email: existingUser.verificado_email,
                        google_auth: existingUser.google_auth,
                        customerFiat: existingUser.customer_id,
                        tos: existingUser.tos_coral,
                        qr_payment: existingUser.qr_payment,
                        tos_eur: needTosEur,
                        fernCustomerId: existingUser?.fern?.fernCustomerId || null,
                        fernWalletId: existingUser?.fern?.fernWalletId || null,
                        fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet?.address || null,
                        KycFer: fernKycStatus.kycStatus || null,
                        KycLinkFer: fernKycStatus.kycLink || null,
                        user_info: user_info_data || false,
                    },
                });
            } else {
                console.log("Usuario no encontrado con Google. No se creará automáticamente. Devolviendo created:false.");

                // Preparar datos básicos para prellenar el registro en el front
                const firstName = given_name || (name ? name.split(" ")[0] : "");
                const lastName = family_name || (name ? name.split(" ").slice(1).join(" ") : "");

                return res.status(200).json({
                    message: "Usuario no encontrado.",
                    created: false,
                    provider: "google",
                    user: {
                        email,
                        firstName,
                        lastName,
                        picture: picture || null,
                        emailVerified: Boolean(email_verified),
                        googleId: sub || null,
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

