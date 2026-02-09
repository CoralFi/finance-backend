import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";

export const getCardById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cardId = req.params.cardId
    const card = await apiRain.getCardById(cardId);
    res.status(200).json({
      success: true,
      card,
    });
  } catch (error: any) {
    console.error("Error en getCardById:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
