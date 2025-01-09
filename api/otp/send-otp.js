import CreateOTPService from "../../services/otp/CreateOTPService.js";

export default async function handler(req, res) {
    
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { email, clientId } = req.body;
    const createOtpService = new CreateOTPService();

    if(req.method === "POST") {
        try {
            const otp = await createOtpService.createOtp(email, clientId);
            res.status(201).json({ message: "Código de validación enviado"});
        } catch (error) {
            res.status(500).json({ message: "Error al enviar el OTP"});
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
    
}