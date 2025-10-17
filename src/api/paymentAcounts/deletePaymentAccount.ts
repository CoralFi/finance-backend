import { Request, Response } from "express";
import { handleDeleteBankAccount } from "@/services/fern/fernServices";

export const deletePaymentAccountController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { paymentAccountId } = req.query as { paymentAccountId?: string };

    if (!paymentAccountId) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'paymentAccountId' es requerido.",
      });
    }

    const response = await handleDeleteBankAccount(paymentAccountId);

    return res.status(200).json({
      success: true,
      message: "Cuenta bancaria eliminada exitosamente",
      data: response,
    });
  } catch (error: any) {
    console.error("Error al eliminar cuenta bancaria:", error.details || error.message);

    return res.status(error.status || 500).json({
      success: false,
      error: "Error al eliminar la cuenta bancaria",
      details: error.details || { message: error.message },
    });
  }
};
