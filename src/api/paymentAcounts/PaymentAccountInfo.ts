import { Request, Response } from "express";
import { getPaymentAccountInfo } from "@/services/fern/paymentAccountService";

export const getPaymentAccountInfoController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get paymentAccountId from params
    const { paymentAccountId } = req.params;

    // Validate required parameter
    if (!paymentAccountId) {
      res.status(400).json({
        error: 'Falta el paymentAccountId en la consulta'
      });
      return;
    }

    // Fetch payment account info from Fern
    const response = await getPaymentAccountInfo(paymentAccountId as string);

    // Success response
    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error al obtener información de la cuenta de pago:', {
      error: error.message,
      status: error.status,
      details: error.details
    });

    // Handle specific error codes
    if (error.message === 'PAYMENT_ACCOUNT_ID_REQUIRED') {
      res.status(400).json({
        error: 'Payment account ID is required'
      });
      return;
    }

    // Handle HTTP errors from Fern API
    if (error.status) {
      res.status(error.status).json({
        error: 'Error al obtener información de la cuenta de pago',
        details: error.details
      });
      return;
    }

    // Generic error
    res.status(500).json({
      error: 'Error al obtener información de la cuenta de pago'
    });
  }
};
