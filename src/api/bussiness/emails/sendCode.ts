import { Request, Response } from 'express';
import ResendService from '../../../services/emails/resend';
import { createCodeBuss } from '../../../services/emails/codeService';
import supabase from '../../../db/supabase';

export const sendCodeController = async (req: Request, res: Response): Promise<Response> => {

  const { email } = req.body as { email: string };
  const resendService = new ResendService();
  try {
    const { data, error } = await supabase
      .from('business')
      .select('*')
      .eq('business_email', email)
      .single();
    if (error || !data?.business_id) {
      console.error('Database error:', error);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    const conduit_id = data.conduit_id;
    const code = await createCodeBuss(conduit_id);
    await resendService.sendCodeEmail(email, 'Código de verificación', code);
    console.log('Code sent successfully to', email);
    return res.status(200).json({
      success: true,
      message: `Code sent successfully to ${email}`,
      code,
    });
  } catch (error: any) {
    console.error('Error sending code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error sending code',
      error: error.message,
    });
  }
};
