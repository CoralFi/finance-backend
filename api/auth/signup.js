import bcrypt from "bcrypt";
import UserService from '../../services/UserService.js'
import UserBO from '../../models/user.js'
import WalletService from "../../services/utila/WalletService.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); // Responde con HTTP 200 OK
    }

    if (req.method === 'POST') {
        const { email, password, nombre, apellido, userType } = req.body;
        const userService = new UserService();
        const walletService = new WalletService();

        if (!email || !password || !nombre || !apellido || !userType) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        try {
            const verifyUser = await userService.verifyUser(email, res);

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insertar el nuevo usuario
            const user = new UserBO(email, hashedPassword, nombre, apellido, userType);
            const createUser = await userService.createUser(user, res);

            // Asociar una wallet a un usuario.
            const createWalletForNewUser = await walletService.createWallet(createUser);

            res.status(201).json({ message: "Usuario registrado exitosamente." });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
