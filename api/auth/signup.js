import bcrypt from "bcrypt";
import UserService from '../../services/UserService.js';
import UserBO from '../../models/user.js';
import WalletService from "../../services/utila/WalletService.js";
import { createClient } from '@supabase/supabase-js';
import SibApiV3Sdk from '@sendinblue/client';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://finance-front-beryl.vercel.app'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { email, password, nombre, apellido, userType } = req.body;
        const userService = new UserService();
        const walletService = new WalletService();

        if (!email || !password || !nombre || !apellido || !userType) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        try {
            // Verificar si el usuario ya existe
            const verifyUser = await userService.verifyUser(email, res);

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar el nuevo usuario
            const user = new UserBO(email, hashedPassword, nombre, apellido, userType);
            const createUser = await userService.createUser(user, res);

            // Asociar una wallet al nuevo usuario
            await walletService.createWallet(createUser);

            // Generar un token único para validación
            const token = crypto.randomBytes(16).toString('hex');

            // Insertar token y estado de validación en Supabase
            const { data, error } = await supabase
                .from('usuarios')
                .update({ token: token, validated: false })
                .eq('email', email);

            console.log(data);
            console.log(error);

            if (error) {
                throw new Error("Error al guardar el token de validación en la base de datos.");
            }

            // Generar el enlace de validación
            const validationLink = `${process.env.BASE_URL}/api/email/validate-email?token=${token}&email=${email}`;

            // Enviar email de validación
            await apiInstance.sendTransacEmail({
                to: [{ email }],
                subject: 'Valida tu email para empezar a usar Coral Finance',
                htmlContent: `<p>Haz click <a href="${validationLink}">aquí</a> para validar tu email y empezar a operar con Coral Finance.</p>`,
                sender: { email: 'contact@coralfinance.io', name: 'Coral Finance' },
            });

            res.status(201).json({ message: "Usuario registrado exitosamente. Email de validación enviado." });
        } catch (error) {
            res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
