import otpService from "./otpService.js";

class ValidateOTPService {
    
    constructor() {
        this.otpService = new otpService();
    }

    // Service para validar el OTP
    async  validateOtpService(email, otp) {
        // Recuperar el OTP almacenado
        try {
            console.log("VALIDATE SERVICES")
            const otpValidation = await this.otpService.validateOtp(email, otp);
            return { message: "OTP validado"};
        }
        catch (error) {
            throw new Error('Error al validar el OTP ' + error);
        } 
    }
}

export default ValidateOTPService;