import { authenticator } from 'otplib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }


    if(req.method === "POST") {
        try {
            const { codigo, userId } = req.body;
    
            const { data, error } = await supabase
                .from('usuarios')
                .select('qr_code')
                .eq('user_id', userId)
                .single();
    
            console.log(data.qr_code);
            console.log(codigo);
            const isValid = authenticator.verify({ token: codigo, secret: data.qr_code });
            
            console.log(isValid);
    
            if(authenticator.verify({ token: codigo, secret: data.qr_code })) {
                res.json({ success: true, message: 'Código válido, transferencia permitida.' });
            } else {
                res.json({ success: false, message: 'Código inválido, transferencia no permitida.' });
            }
            
        } catch (error) {
            res.status(500).json({ message: "Error al validar el código de google auth"});
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
   
}