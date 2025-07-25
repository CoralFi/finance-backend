import jwt from "jsonwebtoken";
import fs from "fs";
class TokenService {
    constructor() {
        // Configuración del servicio
        this.SERVICE_ACCOUNT_EMAIL = process.env.UTILA_SERVICE_ACCOUNT;
        this.UTILIA_API_URI = "https://api.utila.io/";

        // Almacenar token en memoria para evitar regenerarlo en cada llamada
        this.token = null;
        this.expirationTime = null;
    }

    // Método para generar un nuevo token
    generateToken() {
        // Cargar clave privada
        if (!process.env.PRIVATE_KEY_BASE64) {
            throw new Error('La variable de entorno PRIVATE_KEY_BASE64 no está definida');
        }
        
        const privateKey = Buffer.from(process.env.PRIVATE_KEY_BASE64, 'base64').toString('utf8');

        const now = Math.floor(Date.now() / 1000);

        // Si el token es válido, no lo regeneramos
        if (this.token && this.expirationTime > now) {
            return this.token;
        }

        const payload = {
            sub: this.SERVICE_ACCOUNT_EMAIL,
            aud: this.UTILIA_API_URI,
            exp: now + 3600, // Token válido por 1 hora
            iat: now,
        };

        // Firmar el token
        this.token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
        this.expirationTime = now + 3600; // Actualizar tiempo de expiración
        return this.token;
    }

    // Método para obtener el token (y generarlo si no existe o expiró)
    getToken() {
        return this.generateToken();
    }
}

export default TokenService;
