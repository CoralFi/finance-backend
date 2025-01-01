import BrevoClient from '../email/BrevoClient.js';
import otpService from './otpService.js';

class CreateOTPService {

    constructor() {
        this.brevoClient = new BrevoClient();
        this.otpService = new otpService();
    }

    async createOtp(email, clientId) {
        console.log('email', email);
        console.log('clientId', clientId);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar el OTP en la base de datos
        await this.otpService.saveOtp(email, otp);
        
        // Enviar el correo con el OTP
        const emailData = {
            sender: { email: 'contact@coralfinance.io', name: 'Coral Finance' },
            to: [{ email: email }],
            subject: 'Tu código para confirmar la transacción',
            htmlContent: `<p>Tu código es: <strong>${otp}</strong></p><p>Este código es válido por 5 minutos.</p>`,
        };

        await this.brevoClient.sendTransacEmail(emailData);

        return { message: 'OTP enviado con éxito' };
    }
}

export default CreateOTPService;