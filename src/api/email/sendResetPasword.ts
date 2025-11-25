import { Request, Response } from 'express';
import supabase from '../../db/supabase';
import crypto from 'crypto';
import ResendService from '../../services/emails/resend';

const resendService = new ResendService();

export const sendResetPasswordEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: 'Email is required'
      });
    }

    // Buscar usuario
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

    const fullName = `${data.name} ${data.apellido}`;
    // Generar token
    const token = crypto.randomBytes(16).toString('hex');

    // Guardar token en DB
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ reset_token: token })
      .eq('email', email);

    if (updateError) {
      return res.status(500).send({
        success: false,
        message: 'Error updating token'
      });
    }

    const resetLink = `${process.env.BASE_URL_FRONTEND}/reset-password?token=${token}&email=${email}`;

    await resendService.sendResetPasswordEmail(
      email,
      fullName,
      'Resetea tu contraseña',
      resetLink
    );

    return res.status(200).send({
      success: true,
      message: 'Password reset email sent',
      resetLink
    });

  } catch (err) {
    return res.status(500).send({
      success: false,
      message: 'Error sending email'
    });
  }
}
