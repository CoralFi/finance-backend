import { Request, Response } from 'express';
import supabase from '../../db/supabase';
import crypto from 'crypto';
import ResendService from '../../services/emails/resend';

const resendService = new ResendService();

export const sendConfirmEmailController = async (req: Request, res: Response): Promise<Response> => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email } = req.body as { email: string };

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const fullName = `${data.nombre} ${data.apellido}`;

  const token = crypto.randomBytes(16).toString('hex');

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ reset_token: token })
    .eq('email', email);

  if (updateError) {
    return res.status(500).json({
      success: false,
      message: 'Error updating reset token',
    });
  }

  const resetLink = `${process.env.BASE_URL_FRONTEND}/confirm-email?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await resendService.sendConfirmEmail(email, fullName, 'Confirmar tu correo electrónico', resetLink);

    return res.status(200).json({
      success: true,
      message: 'Confirm email sent successfully',
    });
  } catch (err) {
    console.error('Error sending email:', err);
    return res.status(500).json({
      success: false,
      message: 'Error sending email',
    });
  }
};
