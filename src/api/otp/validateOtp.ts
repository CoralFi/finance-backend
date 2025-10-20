import { Request, Response } from 'express';
import ValidateOTPService from '../../services/otp/ValidateOTPService';

export const validateOtpController = async (req: Request, res: Response): Promise<Response> => {

  try {
    const { email, otp } = req.body as { email: string; otp: string };

    const validateOtpService = new ValidateOTPService();
    const result = await validateOtpService.validateOtpService(email, otp);

    return res.status(201).json({ message: result.message });
  } catch (error: any) {
    console.error('Error al validar OTP:', error);
    return res.status(500).json({ message: 'Error al validar el OTP' });
  }
};
