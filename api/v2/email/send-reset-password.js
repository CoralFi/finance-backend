import supabase from '../supabase.js';
import ResendService from '../../../services/email/resend.js';
import crypto from 'crypto';
const resendService = new ResendService();
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

    // Actualizar el token en Supabase
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ reset_token: token })
        .eq('email', email);

    if (updateError) return res.status(500).send({
        success: false,
        message: 'Error updating reset token'
    });

    // Generar el enlace de restablecimiento
    const resetLink = `${process.env.BASE_URL_FRONTEND}/reset-password?token=${token}&email=${email}`;

    try {
        
        await resendService.sendResetPasswordEmail(email, fullName, 'Resetea tu contraseña', resetLink);

        res.status(200).send({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error sending email'
        });
    }
}