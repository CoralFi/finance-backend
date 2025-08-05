import supabase from "../supabase.js";
import bcrypt from "bcrypt";
import CustomerService from "../../../services/sphere/CustomerService.js";
import { FernKycStatus } from "../../../services/fern/kycStatus.js";
import { getFernWalletCryptoInfo } from "../../../services/fern/wallets.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, password } = req.body;

    const customerService = new CustomerService();
    
    try{
        // find user in DB without fern
        const { data: user, error } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(400).json({ message: "Usuario no encontrado." });
        }

        // compare password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        // find fern in DB
        const { data: fern, error: fernError } = await supabase
            .from("fern")
            .select("*")
            .eq("user_id", user.user_id)
            .single();

        user.fern = fern;

        let fernKycStatus = { kycStatus: null, kycLink: null };

        // update the fern kyc status
        if (user.fern?.fernCustomerId) {
            try {
                fernKycStatus = await FernKycStatus(user.fern?.fernCustomerId, user.user_id);
                
                // Check if there was an error with the Fern API
                if (fernKycStatus.error) {
                    console.warn("Fern API error during login:", fernKycStatus.error);
                    // Continue with login process despite Fern API error
                }
            } catch (fernError) {
                console.error("Unexpected error with Fern KYC status:", fernError);
                // Continue with login process despite Fern API error
            }
        }


        const { data: user_info_data, error: user_info_error } = await supabase
            .rpc("user_info_exists", {
                p_user_id: user.user_id
            })
        
        if (user_info_error) {
            console.error("Error checking user info:", user_info_error);
            return res.status(500).json({ message: "Error al iniciar sesión." + user_info_error });
        }
            
        let fernWalletCryptoInfo = null;
        if (user.fern?.fernWalletId) {
            try {
                fernWalletCryptoInfo = await getFernWalletCryptoInfo(user.fern?.fernWalletId);
                // If the API call returns null, log a warning
                if (fernWalletCryptoInfo === null) {
                    console.warn("Fern wallet info not found for wallet ID:", user.fern.fernWalletId);
                }
            } catch (walletError) {
                console.error("Error retrieving Fern wallet info:", walletError);
                // Continue with login process despite wallet API error
            }
        }

        // Success
        console.log("Inicio de sesión exitoso.", user);

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
                verificado_email: user.verificado_email,
                google_auth: user.google_auth,
                customerFiat: user.customer_id,
                tos: user.tos_coral,
                qr_payment: user.qr_payment,
                tos_eur: needTosEur,
                fernCustomerId: user.fern?.fernCustomerId || null,
                fernWalletId: user.fern?.fernWalletId || null,
                fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet.address || null,
                KycFer: fernKycStatus.kycStatus || null,
                KycLinkFer: fernKycStatus.kycLink || null,
                user_info: user_info_data || false,
            },
        });

    }catch(error){
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ message: "Error al iniciar sesión." + error });
    }

}