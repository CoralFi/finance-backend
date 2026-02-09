import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

export const getMeController = async (req: AuthRequest, res: Response) => {

    const user = req.user;

    return res.status(200).json({
        success: true,
        user: user
    });
};
