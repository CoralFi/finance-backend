import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { email } = req.query;

    try {
        // Generar una clave secreta única
        const secret = authenticator.generateSecret();
        console.log(`Clave secreta: ${secret}`);

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ qr_code: secret })
            .eq('email', email);

        // Crear una URL para Google Authenticator
        const issuerName = 'CoralFinance';
        console.log(`Email: ${email}`);
        const otpauthUrl = authenticator.keyuri(email, issuerName, secret);

        console.log(`URL de Google Authenticator: ${otpauthUrl}`);

        // Enviar la clave secreta y el QR al frontend
        res.json({
            secret: secret,
            qrCode: otpauthUrl
        });

    } catch(error) {
        res.status(500).json({ message: "Error al generar el QR"});
    }

}

