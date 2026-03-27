import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const customerId = req.user?.customer_id;
        const data = req.body;

        if (!customerId) {
            res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
            });
            return;
        }
        const rainUser = await getRainUserByCustomerId(customerId);
        if (!rainUser || !rainUser.rain_user_id) {
            res.status(404).json({
                success: false,
                message: "Rain user no encontrado para este customer",
            });
            return;
        }
        // Platinum: 406
        // Signature: 424
        // Infinite: 428
 
        const payload = {
            ...data,
            type: data?.type ?? "virtual",
            configuration: {
                ...(data?.configuration || {}),
                productId: "406",
            },
        };

        const card = await apiRain.createCard(payload, rainUser.rain_user_id);
        res.status(200).json({
            success: true,
            card,
        });
    } catch (error: any) {
        console.error("Error en kycStatus:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Error interno del servidor",
        });
    }
};
