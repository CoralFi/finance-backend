import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import apiRain from "@/services/rain/apiRain";
export const automationsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, source, destination } = req.body;
    const userId = req.user?.customer_id;
    // Validar que venga el parámetro type
    if (!type || (type !== "onramp" && type !== "offramp")) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'type' debe ser 'onramp' o 'offramp'.",
      });
      return;
    }

    if (type === "onramp") {
      // Validaciones para onramp
      if (!source || !source.currency || !source.rail) {
        res.status(400).json({
          success: false,
          message: "Faltan datos en 'source' (currency, rail).",
        });
        return;
      }

      if (!destination || !destination.currency || !destination.rail) {
        res.status(400).json({
          success: false,
          message: "Faltan datos en 'destination' (currency, rail).",
        });
        return;
      }

      if (!destination.address || destination.address.type !== "onchain" || !destination.address.address) {
        res.status(400).json({
          success: false,
          message: "Faltan datos válidos en 'destination.address'.",
        });
        return;
      }
      const onramp = {
        userId,
        type,
        source,
        destination,
      }
      const response = await apiRain.generateOnramp(onramp);
      // De momento responder el mismo JSON recibido
      res.status(200).json({
        success: true,
        response
      });
    } else if (type === "offramp") {
      // De momento solo retornar un mensaje simple
      res.status(200).json({
        success: true,
        message: "offramp",
      });
    }

  } catch (error: any) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
