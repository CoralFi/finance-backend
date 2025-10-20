import BrevoClient from './brevoClient';
import OtpService from './otpServices';

interface EmailData {
  sender: { email: string; name: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
}

export default class CreateOTPService {
  private brevoClient: BrevoClient;
  private otpService: OtpService;

  constructor() {
    this.brevoClient = new BrevoClient();
    this.otpService = new OtpService();
  }

  public async createOtp(email: string, clientId: string): Promise<{ message: string }> {
    console.log('email', email);
    console.log('clientId', clientId);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar el OTP en la base de datos
    await this.otpService.saveOtp(email, otp);

    // Enviar el correo con el OTP
    const emailData: EmailData = {
      sender: { email: 'contact@coralfinance.io', name: 'Coral Finance' },
      to: [{ email }],
      subject: 'Tu código para confirmar la transacción',
      htmlContent: `<p>Tu código es: <strong>${otp}</strong></p><p>Este código es válido por 5 minutos.</p>`,
    };

    await this.brevoClient.sendTransacEmail(emailData);

    return { message: 'OTP enviado con éxito' };
  }
}



