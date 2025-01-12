import ValidateOTPService from "../../services/otp/ValidateOTPService.js";

export default async function handler(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Manejar solicitudes OPTIONS (preflight)
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if(req.method === "POST") {
            const { email, otp } = req.body;
            const validateOtpService = new ValidateOTPService();
    
            try {
                const otpValidation = await validateOtpService.validateOtpService(email, otp);
                res.status(201).json({ message: otpValidation.message });
            } catch (error) {
                res.status(500).json({ message: "Error al validar el OTP"});
            }
        } else {
            return res.status(405).json({message: "Método no permitido"});
        }
    
}