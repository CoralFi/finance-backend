import { Request, Response } from "express";

export const logoutController = async (req: Request, res: Response) => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const cookieOptions = {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: isDevelopment ? ('lax' as const) : ('none' as const),
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return res.status(200).json({ message: "Sesión cerrada exitosamente." });
};
