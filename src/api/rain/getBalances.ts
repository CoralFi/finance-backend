import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
export const getBalances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.rain_id;
    console.log(req.user.rain_id)
    const balances = await apiRain.getBalanceByUserId(userId);
    res.status(200).json({
      success: true,
      balances,
    });
  } catch (error: any) {

    console.error("Error en getBalances:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
}; 