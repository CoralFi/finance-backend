import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import supabase from '../../db/supabase';  

export const verifyGoogleAuthController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { codigo, userId } = req.body as { codigo: string; userId: string };

    const { data, error } = await supabase
      .from('usuarios')
      .select('qr_code')
      .eq('user_id', userId)
      .single();

    if (error || !data?.qr_code) {
      return res.status(404).json({ message: 'No se encontró el QR Code del usuario' });
    }

    const isValid = authenticator.verify({ token: codigo, secret: data.qr_code });

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Código inválido, transferencia no permitida.' });
    }

    await supabase
      .from('usuarios')
      .update({ google_auth: true })
      .eq('user_id', userId);

    return res.status(200).json({ success: true, message: 'Código válido, transferencia permitida.' });
  } catch (error: any) {
    console.error('Error al validar el código de Google Auth:', error);
    return res.status(500).json({
      message: 'Error al validar el código de Google Auth',
      error: error.message,
    });
  }
};
