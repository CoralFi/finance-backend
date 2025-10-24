import { Request, Response } from "express";
import { createFernTransaction } from "@/services/fern/transactionsService";

/**
 * Controller to create a new transaction
 * POST /api/transactions
 */
export const createTransactionController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quoteId } = req.body;

    // Validate required field
    if (!quoteId) {
      res.status(400).json({
        error: 'quoteId es requerido'
      });
      return;
    }

    // Create transaction using service
    const transaction = await createFernTransaction(quoteId);

    // Return successful response
    res.status(200).json(transaction);

  } catch (error: any) {
    console.error('Error al crear transacción en Fern:', {
      message: error.message,
      response: error.details,
      stack: error.stack
    });

    // Handle specific error codes
    const errorMessages: { [key: string]: string } = {
      'QUOTE_ID_REQUIRED': 'El ID de cotización es requerido'
    };

    const errorMessage = errorMessages[error.message] || 'Error al crear la transacción';
    const statusCode = error.status || (errorMessages[error.message] ? 400 : 500);

    res.status(statusCode).json({
      error: errorMessage,
      details: error.details || error.message
    });
  }
};
