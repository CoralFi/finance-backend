import supabase from "../supabase.js";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, password } = req.body;
    
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

        // find fern in DB
        const { data: fern, error: fernError } = await supabase
            .from("fern")
            .select("*")
            .eq("user_id", user.user_id)
            .single();

        user.fern = fern;
        
        // compare password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        // Success
        console.log("Inicio de sesión exitoso.", user);

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
                tos_eur: user.tos_eur,
                fernCustomerId: user.fern?.fernCustomerId || null,
                fernWalletId: user.fern?.fernWalletId || null,
                KycFer: user.fern?.Kyc || null,
                KycLinkFer: user.fern?.KycLink || null,
            },
        });

    }catch(error){
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ message: "Error al iniciar sesión." });
    }

}