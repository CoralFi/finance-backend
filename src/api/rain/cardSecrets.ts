import { Request, Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { generateSessionId } from "@/services/rain/secrets/generateSessionId";
import { decryptSecret } from "@/services/rain/secrets/decryptSecret";

export const getCardSecrets = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: "cardId es requerido",
      });
    }
    const { sessionId, secretKey } = generateSessionId();
    const response = await apiRain.getCardSecrets(cardId, sessionId);
    
    // const pan = decryptSecret(response.encryptedPan.data, response.encryptedPan.iv, secretKey);
    // const cvv = decryptSecret(response.encryptedCvc.data, response.encryptedCvc.iv, secretKey);

    return res.status(200).json({
      success: true,
      response
    });
  } catch (error: any) {
    console.error("Error getCardSecrets:", error);

    return res.status(500).json({
      success: false,
      message: "Error obteniendo secretos de la tarjeta",
    });
  }
};
