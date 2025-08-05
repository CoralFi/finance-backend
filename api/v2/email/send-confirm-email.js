//end point to send confirm email
import supabase from '../supabase.js';
import crypto from 'crypto';
import ResendService from '../../../services/email/resend.js';
const resendService = new ResendService();
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email } = req.body;
    // Buscar al usuario en Supabase
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) {
        return res.status(404).send({
            success: false,
            message: 'User not found'
        });
    }

    const fullName = data.nombre + ' ' + data.apellido;

    // Generar un token de restablecimiento
    const token = crypto.randomBytes(16).toString('hex');

    const resetLink = `${process.env.BASE_URL_FRONTEND}/confirm-email?token=${token}&email=${email}`;

    try {
        
        await resendService.sendConfirmEmail(email, fullName, 'Confirmar tu correo electrónico', resetLink);

        res.status(200).send({
            success: true,
            message: 'Confirm email sent successfully'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({
            success: false,
            message: 'Error sending email'
        });
    }
}
