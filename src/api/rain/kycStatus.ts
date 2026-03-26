import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";

export const kycStatus = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!rainUser?.rain_user_id) {
      res.status(404).json({
        success: false,
        message: "Rain user no encontrado para este customer",
      });
      return;
    }

    const statusKyc = await apiRain.getLinkKyc(rainUser.rain_user_id);
 
    let linkKyc: string | null = null;

    const linkSource =
      statusKyc.applicationExternalVerificationLink ??
      statusKyc.applicationCompletionLink ??
      null;

    if (linkSource?.url && linkSource?.params) {
      const params = new URLSearchParams(linkSource.params).toString();
      linkKyc = `${linkSource.url}?${params}`;
    } 
    res.status(200).json({
      success: true,
      statusKyc,
      ...(linkKyc ? { linkKyc } : {})  
    });

  } catch (error: any) {
    console.error("Error en kycStatus:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
