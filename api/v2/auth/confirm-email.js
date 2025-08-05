import supabase from '../supabase.js';
import ResendService from '../../../services/email/resend.js';
const resendService = new ResendService();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const { token, email } = req.query;

    try {
        // Buscar al usuario y validar el token
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('reset_token', token)
            .single();

        if (error || !data) return res.status(400).send({
            success: false,
            message: 'Invalid token or email'
        });

        // Actualizar el token de restablecimiento y el estado de verificación
        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ reset_token: null, verificado_email: true })
            .eq('email', email);

        if (updateError) return res.status(500).send({
            success: false,
            message: 'Error updating token'
        });

        // Enviar correo de confirmación
        await resendService.sendConfirmedEmail(email, data.nombre + ' ' + data.apellido, 'Confirmación de Correo Electrónico');

        res.status(200).json({
            success: true,
            message: 'Email confirmed successfully'
        });
    } catch (error) {
        console.error('Error al confirmar el correo:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al confirmar el correo',
            details: error.response?.data || error.message
        });
    }
}