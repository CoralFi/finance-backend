import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
 
export const getInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.rain_id;
    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    const userInfo = await apiRain.getInfo(customerId);
    res.status(200).json({
      success: true,
      data: userInfo,
    });
  } catch (error: any) {
    console.error("Error en getInfo:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
