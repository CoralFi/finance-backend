import { Request, Response } from "express";
import { verifyReferralCode } from "@/services/userService";
import { ApiResponse } from "@/services/types/request.types";

export const verifyReferralCodeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referral_code } = req.body;
    if (!referral_code || typeof referral_code !== 'string' || referral_code.trim() === '') {
      res.status(400).json({
        success: false,
        message: "El campo 'referral_code' es obligatorio.",
        error: "MISSING_REFERRAL_CODE"
      } as ApiResponse);
      return;
    }
    const result = await verifyReferralCode(referral_code.trim());
    
    if (result === null) {
      res.status(500).json({
        success: false,
        message: "Error interno al verificar el código de referido.",
        error: "VERIFICATION_ERROR"
      } as ApiResponse);
      return;
    }
    if (result === false) {
      res.status(400).json({
        success: false,
        message: "El código de referido no existe.",
        error: "INVALID_REFERRAL_CODE",
        data: {
          exists: false
        }
      } as ApiResponse);
      return;
    }
    res.status(200).json({
      success: true,
      message: "Código de referido válido.",
      data: {
        exists: true,
        referral_code: referral_code.trim()
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error("Error en verifyReferralCodeController:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message || "INTERNAL_SERVER_ERROR"
    } as ApiResponse);
  }
};
