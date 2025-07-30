import ResendService from '../../../services/email/resend.js';
import { createCode } from '../../../services/email/codeService.js';
import supabase from '../supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email } = req.body;
    const resendService = new ResendService();

    try {
        // obtain user id by email from supabase
        const { data, error } = await supabase
            .from('usuarios')
            .select('user_id')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Database error:', error);
            throw new Error(`Error getting user id: ${error.message}`);
        }

        const userId = data.user_id;

        const code = await createCode(userId);

        await resendService.sendCodeEmail(email, 'Código de verificación', code);

        console.log('Code sent successfully to', email);

        res.status(200).json(
            {
                success: true,
                message: 'Code sent successfully to ' + email,
                code
            }
        );
    } catch (error) {
        console.error('Error sending code:', error);
        res.status(500).json(
            {
                success: false,
                message: 'Error sending code',
                error: error.message
            }
        );
    }
}
