import { Request, Response } from "express";
import { listFernBankAccounts } from "@/services/fern/fernServices";
import { AuthRequest } from "../../middleware/authMiddleware";

export const listPaymentAccountsController = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { currency, type, chain } = req.query as {

      currency?: string;
      type?: string;
      chain?: string;
    };
    const customerId = req.user.fern_customer_id
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "El parámetro 'customerId' es requerido.",
      });
    }

    const accounts = await listFernBankAccounts(customerId, currency, type, chain);

    return res.status(200).json({
      success: true,
      count: Array.isArray(accounts) ? accounts.length : 0,
      data: accounts,
    });
  } catch (error: any) {
    console.error("Error al listar cuentas bancarias:", error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      error: "Error al listar las cuentas bancarias",
      details: error.response?.data || error.message,
    });
  }
};
