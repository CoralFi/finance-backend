import bcrypt from "bcrypt";
import UserService from '../../services/UserService.js'
import UserBO from '../../models/user.js'
import WalletService from "../../services/utila/WalletService.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { email, password, nombre, apellido, userType } = req.body;
    const userService = new UserService();
    const walletService = new WalletService();

    if (!email || !password || !nombre || !apellido || !userType) {
        return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    try {
        const verifyUser = await userService.verifyUser(email);

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario
        const user = new UserBO(email, hashedPassword, nombre, apellido, userType);
        const createUser = await userService.createUser(user, res);

        // Asociar una wallet a un usuario.
        console.log("Create user: ", createUser)
        const createWalletForNewUser = await walletService.createWallet(createUser);
        console.log(createWalletForNewUser.wallet.name)

        res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
    }
}
