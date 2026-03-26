import { Request, Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "@/middleware/authMiddleware";
export const getCompanyContracts = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const companyId = req.user?.rain_id ??  null;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId es requerido",
      });
    }

    const contracts = await apiRain.getCompanyContracts(companyId);

    return res.status(200).json({
      success: true,
      contracts,
    });
  } catch (error: any) {
    console.error("Error en getCompanyContracts:", error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: error.response?.data || "Error interno del servidor",
    });
  }
};