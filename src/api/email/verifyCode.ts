import { Request, Response } from 'express';
import { verifyCode } from '../../services/emails/codeService';
export const verifyCodeController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { user_id, code } = req.body as { user_id: string; code: number };
    if (!user_id || !code) {
      return res.status(400).json({
        success: false,
        message: 'user_id y code son requeridos',
      });
    }
    const isVerified = await verifyCode(user_id, code);
    if (isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Code verified successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid code',
      });
    }
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying code',
      error: error.message || error,
    });
  }
};
