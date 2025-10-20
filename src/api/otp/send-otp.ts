import { Request, Response } from 'express';
import CreateOTPService from '../../services/otp/createOtpServices';

export const sendOtpController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, clientId } = req.body as { email: string; clientId: string };

    const createOtpService = new CreateOTPService();
    await createOtpService.createOtp(email, clientId);

    return res.status(201).json({ message: 'Código de validación enviado' });
  } catch (error) {
    console.error('Error en sendOtpController:', error);
    return res.status(500).json({ message: 'Error al enviar el OTP' });
  }
};
