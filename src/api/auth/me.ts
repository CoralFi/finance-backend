import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export const getMeController = async (req: AuthRequest, res: Response) => {

    const user = req.user;

    return res.status(200).json({
        success: true,
        user: {
            customer_id: user.customer_id,
            email: user.email,
            firstName: user.nombre,
            lastName: user.apellido,
            userType: user.user_type,
        }
    });
};
