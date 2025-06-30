import { OAuth2Client } from "google-auth-library";
import UserBO from "../../models/user.js";
import bcrypt from 'bcrypt';
import { createFernCustomer } from "../../services/fern/Customer.js";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { FernKycStatus } from "../../services/fern/kycStatus.js";
import { getFernWalletCryptoInfo } from "../../services/fern/wallets.js";
import jwt from 'jsonwebtoken';
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

                // find fern in DB
                const { data: fern, error: fernError } = await supabase
                    .from("fern")
                    .select("*")
                    .eq("user_id", existingUser.user_id)
                    .single();

                existingUser.fern = fern;

                let fernKycStatus = { kycStatus: null, kycLink: null };

                // update the fern kyc status
                if (existingUser.fern?.fernCustomerId) {
                    fernKycStatus = await FernKycStatus(existingUser.fern?.fernCustomerId, existingUser.user_id);
                }

                let fernWalletCryptoInfo = null;
                if (existingUser.fern?.fernWalletId) {
                    fernWalletCryptoInfo = await getFernWalletCryptoInfo(existingUser.fern?.fernWalletId);
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
                        google_auth: existingUser.google_auth,
                        customerFiat: existingUser.customer_id,
                        tos: existingUser.tos_coral,
                        tos_eur: existingUser.tos_eur,
                        fernCustomerId: existingUser?.fern?.fernCustomerId || null,
                        fernWalletId: existingUser?.fern?.fernWalletId || null,
                        fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet?.address || null,
                        KycFer: fernKycStatus.kycStatus || null,
                        KycLinkFer: fernKycStatus.kycLink || null,
                    },
                });
            } else {
                console.log("El usuario no existe en la base de datos. Procediendo con el registro.");
                await supabase.rpc('begin'); // Start transaction

                try {
                    const nameSplit = name.split(" ");
                    const firstName = nameSplit[0];
                    const lastName = nameSplit.slice(1).join(" ");

                    const randomPassword = crypto.randomBytes(16).toString('hex');
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    // Create user directly in Supabase
                    const { data: newUser, error: insertError } = await supabase
                        .from('usuarios')
                        .insert({
                            email: email,
                            password: hashedPassword,
                            nombre: firstName,
                            apellido: lastName,
                            user_type: 'persona',
                            tos_coral: true, // Asumir aceptado en login social
                            google_auth_enabled: false,
                        })
                        .select()
                        .single();

                    if (insertError) throw insertError;

                    // Create Fern Customer
                    const fernCustomer = await createFernCustomer({
                        user_id: newUser.user_id,
                        customerType: newUser.user_type,
                        email: newUser.email,
                        firstName: newUser.nombre,
                        lastName: newUser.apellido,
                    });

                    await supabase.rpc('commit'); // Commit transaction

                    return res.status(200).json({
                        message: "Usuario creado y autenticado exitosamente.",
                        user: {
                            id: newUser.user_id,
                            firstName: newUser.nombre,
                            lastName: newUser.apellido,
                            email: newUser.email,
                            userType: newUser.user_type,
                            kyc: newUser.kyc_state,
                            wallet: newUser.wallet_id,
                            google_auth: newUser.google_auth_enabled,
                            customerFiat: newUser.customer_id,
                            tos: newUser.tos_coral,
                            tos_eur: newUser.tos_eur,
                            fernCustomerId: fernCustomer.fernCustomerId,
                            fernWalletId: fernCustomer.fernWalletId,
                            fernWalletAddress: fernCustomer.fernWalletAddress,
                            KycFer: fernCustomer.Kyc,
                            KycLinkFer: fernCustomer.KycLink,
                        },
                    });

                } catch (error) {
                    await supabase.rpc('rollback');
                    console.error("Error en el registro durante el login con Google:", error);
                    return res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
                }
            }
        } catch (error) {
            console.error("Error en Google Login:", error);
            res.status(500).json({ message: "Error al realizar el login con Google", error: error.message });
        }
    } else {
        res.status(405).json({ message: "Método no permitido" });
    }
}

