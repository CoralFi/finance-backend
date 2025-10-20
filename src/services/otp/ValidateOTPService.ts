import OtpService from './otpServices';

export default class ValidateOTPService {
  private otpService: OtpService;

  constructor() {
    this.otpService = new OtpService();
  }

  // Servicio para validar el OTP
  public async validateOtpService(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    try {
      console.log('VALIDATE SERVICES');
      const otpValidation = await this.otpService.validateOtp(email, otp);

      // otpValidation puede devolver { message: string } o { error: string }
      if ('error' in otpValidation) {
        throw new Error(otpValidation.error);
      }

      return { message: otpValidation.message };
    } catch (error: any) {
      throw new Error('Error al validar el OTP: ' + error.message);
    }
  }
}
