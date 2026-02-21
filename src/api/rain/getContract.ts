import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";

export const getContract = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.customer_id;
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


    const card = await apiRain.getContract(rainUser.rain_user_id);
    res.status(200).json({
      success: true,
      card,
    });
  } catch (error: any) {
    console.error("Error en getContract:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
