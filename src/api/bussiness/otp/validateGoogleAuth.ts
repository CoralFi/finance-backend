import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import supabase from '@/db/supabase';

export const verifyGoogleAuthController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { customer_id, codigo } = req.body as { customer_id: string; codigo: string };

        const { data, error } = await supabase
            .from('business')
            .select('qr_code')
            .eq('business_id', customer_id)
            .single();

        if (error || !data?.qr_code) {
            return res.status(404).json({ message: 'No se encontró el QR Code del usuario' });
        }

        const isValid = authenticator.verify({ token: codigo, secret: data.qr_code });

        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Código inválido, transferencia no permitida.' });
        }

        await supabase
            .from('business')
            .update({ google_auth: true })
            .eq('business_id', customer_id);

        return res.status(200).json({ success: true, message: 'Código válido, transferencia permitida.' });
    } catch (error: any) {
        console.error('Error al validar el código de Google Auth:', error);
        return res.status(500).json({
            message: 'Error al validar el código de Google Auth',
            error: error.message,
        });
    }
};
