import supabase from '../supabase.js';
import ResendService from '../../../services/email/resend.js';
import bcrypt from 'bcrypt';

const resendService = new ResendService();

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    } 

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { token, email } = req.query;

    const { newPassword } = req.body;
    
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

    const isSamePassword = await bcrypt.compare(newPassword, data.password);
    
    if (isSamePassword) {
        return res.status(400).send({
            success: false,
            message: 'La nueva contraseña debe ser diferente a la contraseña actual'
        });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const fullName = data.nombre + ' ' + data.apellido;
    // Actualizar la contraseña y eliminar el token
    const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: hashedPassword, reset_token: null })
        .eq('email', email);

    if (updateError) return res.status(500).send({
        success: false,
        message: 'Error updating password'
    });


    await resendService.sendConfirmResetPasswordEmail(email, fullName, 'Confirmación de Cambio de Contraseña');
    
    res.status(200).send({
        success: true,
        message: 'Password reset successfully'
    });
}