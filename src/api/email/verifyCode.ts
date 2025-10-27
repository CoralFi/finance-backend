import { Request, Response } from 'express';
import { verifyCodeDB } from '@/services/emails/codeService';

/**
 * Controlador para verificar código usando customer_id y función de base de datos
 */
export const verifyCodeController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { customer_id, code } = req.body as { customer_id: string; code: number };
    
    if (!customer_id || !code) {
      return res.status(400).json({
        success: false,
        message: 'customer_id y code son requeridos',
      });
    }

    const isVerified = await verifyCodeDB(customer_id, code);
    
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
    console.error('Error verifying code with DB function:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying code',
      error: error.message || error,
    });
  }
};
