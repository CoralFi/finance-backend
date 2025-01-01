import { OAuth2Client } from 'google-auth-library';
import UserBO from '../../models/user.js';
import UserService from '../../services/UserService.js';
import WalletService from "../../services/utila/WalletService.js";


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; 
const client = new OAuth2Client(CLIENT_ID);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({message: "Método no permitido"});
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === "POST") {
        try {
            const { token } = req.body;
            const userService = new UserService();
            const walletService = new WalletService();
    
            const ticket = await client.verifyIdToken({
                idToken: token,
            });

            const payload = ticket.getPayload();
            const { email, name, sub } = payload;
            
            // TODO: ver como se guarda el name en google y unificar los campos en la base de datos de ser necesario.
            // TODO: los datos del userType estan incompletos.
            const user = new UserBO(email, null, name, apellido, null);
            const createUser = await userService.createUser(user, res);

             // Asociar una wallet al nuevo usuario
             await walletService.createWallet(createUser);

             // Insertar token y estado de validación en Supabase
            const { data, error } = await supabase
                .from('usuarios')
                .update({ validated: true })
                .eq('email', email);

        } catch (error) {
            res.status(500).json({ message: "Error al realizar el login con Google" });
        }   
    }
}