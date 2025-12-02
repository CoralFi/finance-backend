import { Request, Response } from "express";
import { FernKycUpdate } from "@/services/fern/fernServices";
import supabase from "@/db/supabase";

export const FernKycUpdateController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { kycData, userId } = req.body;
    const { data: fernData, error: fernError } = await supabase
      .from("fern")
      .select("fernCustomerId")
      .eq("user_id", userId)
      .single();

    if (!fernData?.fernCustomerId) {
      console.error("Error getting fern data:", fernError);
      return res.status(500).json({
        message: "Error getting fern data",
      });
    }

    console.log("Fern data:", fernData.fernCustomerId);

    if (!kycData) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
      });
    }

    // 🔹 Ejecutar actualización KYC
    const response = await FernKycUpdate(
      fernData.fernCustomerId,
      kycData,
      userId
    );

    if (response.success) {
      return res.status(200).json(response);
    } else {
      return res.status(500).json(response);
    }
  } catch (error: any) {
    console.error(
      "Error al actualizar cliente en Fern:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      error: {
        message: error.response?.data?.message || error.message,
        status: error.response?.status || "unknown",
        details: error.response?.data?.details || null,
      },
    });
  }
}

