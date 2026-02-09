import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'secretTest123';

export const refreshController = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: "No hay token de actualización." });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; email: string, role: string };


        const accessToken = jwt.sign(
            {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({ message: "Token renovado correctamente." });
    } catch (error: any) {
        console.error("Error al renovar token:", error.message);
        return res.status(403).json({ message: "Token de actualización inválido o expirado." });
    }
};
