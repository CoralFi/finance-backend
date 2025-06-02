import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Método no permitido" });
    }

    try {
        const { codigo, userId } = req.body;

        const { data } = await supabase
            .from('usuarios')
            .select('qr_code')
            .eq('user_id', userId)
            .single();

        const isValid = authenticator.verify({ token: codigo, secret: data.qr_code });

        if (isValid) {
            // Update the user's google_auth status to true
            await supabase
                .from('usuarios')
                .update({ 'google_auth': true })
                .eq('user_id', userId);
            
            res.status(200).json({ success: true, message: 'Código válido, transferencia permitida.' });
        } else {
            res.status(401).json({ success: false, message: 'Código inválido, transferencia no permitida.' });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al validar el código de google auth", error: error.message });
    }
}