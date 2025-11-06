import { Request, Response } from "express";
import { createFernTransaction } from "@/services/fern/transactionsService";
import supabase from "@/db/supabase";

const isDevelopment = process.env.NODE_ENV === 'development';

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

    if (isDevelopment) {
      console.log('Transacción creada en Fern:', transaction);
    }

    // Save transaction in database
    const {data: savedTransaction, error: saveError} = await supabase
    .from('fern_transactions')
    .insert({
      transaction_id: transaction.transactionId,
      customer_id: transaction.customerId,
      quote_id: transaction.quoteId,
      correlation_id: transaction.correlationId || '',
      transaction_status: transaction.transactionStatus,
      source_currency: transaction.source?.sourceCurrency.label || '',
      source_payment_method: transaction.source?.sourcePaymentMethod || '',
      source_amount: transaction.source?.sourceAmount || '0',
      source_payment_account_id: transaction.source?.sourcePaymentAccountId || '',
      destination_payment_account_id: transaction.destination?.destinationPaymentAccountId || '',
      destination_payment_method: transaction.destination?.destinationPaymentMethod || '',
      destination_currency: transaction.destination?.destinationCurrency.label || '',
      exchange_rate: transaction.destination?.exchangeRate || null,
      destination_amount: transaction.destination?.destinationAmount || null,
      fee_currency: transaction.fees?.feeCurrency.label || '',
      fern_fee_amount: transaction.fees?.fernFee.feeAmount || '0',
      fern_fee_usd_amount: transaction.fees?.fernFee.feeUSDAmount || '0',
      developer_fee_amount: transaction.fees?.developerFee.feeAmount || '0',
      developer_fee_usd_amount: transaction.fees?.developerFee.feeUSDAmount || '0',
      expires_at: transaction.expiresAt,
      raw_response: transaction
    })
    .select('id, transaction_id, created_at')
    .single();

    if (isDevelopment) {
      console.log('Transacción guardada en Fern:', savedTransaction);
    }

    if (saveError) {
      throw saveError;
    }

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
