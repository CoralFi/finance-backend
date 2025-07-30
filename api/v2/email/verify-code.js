import { verifyCode } from '../../../services/email/codeService.js';


export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { user_id, code } = req.body;

    try {
        const isVerified = await verifyCode(user_id, code);
        
        if (isVerified) {
            return res.status(200).json(
                {
                    success: true,
                    message: 'Code verified successfully'
                }
            );
        } else {
            return res.status(400).json(
                {
                    success: false,
                    message: 'Invalid code'
                }
            );
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        return res.status(500).json(
            {
                success: false,
                message: 'Error verifying code',
                error: error.message
            }
        );
    }
}