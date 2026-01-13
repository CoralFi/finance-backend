import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserByCustomerId } from '../api/authv2/helpers/authHelpers';

const JWT_SECRET = process.env.JWT_SECRET || 'secretTest123';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: "No autorizado. Token faltante." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

        const user = await getUserByCustomerId(decoded.userId);
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado o inválido." });
        }
        if (user.user_type !== decoded.role) {
            return res.status(403).json({ message: "Acceso denegado. Rol no coincide." });
        }

        req.user = user;
        next();
    } catch (error: any) {
        console.error("Error en authMiddleware:", error.message);
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};
