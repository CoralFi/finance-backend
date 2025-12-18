import { Request, Response } from "express";
import { createFernQuote } from "@/services/fern/quotesService";
import { QuoteRequestData } from "@/services/types/fern.types";
import supabase from "@/db/supabase";

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Controller to create a new quote
 * POST /api/quotes
 */
export const createQuoteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const quoteData: QuoteRequestData = req.body;

    // Validate required fields
    if (!quoteData.customerId || !quoteData.source || !quoteData.destination) {
      res.status(400).json({
        error: 'Faltan campos requeridos: customerId, source, destination'
      });
      return;
    }

    // Validate source fields
    if (
      !quoteData.source.sourcePaymentAccountId ||
      !quoteData.source.sourceCurrency ||
      !quoteData.source.sourcePaymentMethod ||
      !quoteData.source.sourceAmount
    ) {
      res.status(400).json({
        error: 'Faltan campos requeridos en source: sourcePaymentAccountId, sourceCurrency, sourcePaymentMethod, sourceAmount'
      });
      return;
    }

    // Validate destination fields
    if (
      !quoteData.destination.destinationPaymentAccountId ||
      !quoteData.destination.destinationCurrency
    ) {
      res.status(400).json({
        error: 'Faltan campos requeridos en destination: destinationPaymentAccountId, destinationCurrency'
      });
      return;
    }

    // Create quote using service
    const quote = await createFernQuote(quoteData);

    if (isDevelopment) {
      console.log('Cotización creada en Fern:', quote);
    }

    // Save quote in database
    const {data: savedQuote, error: saveError} = await supabase
    .from('fern_quotes')
    .insert({
      quote_id: quote.quoteId,
      fern_customer_id: quoteData.customerId,
      estimated_exchange_rate: quote.estimatedExchangeRate,
      destination_amount: quote.destinationAmount,
      fee_currency: quote.fees?.feeCurrency.label || '',
      fern_fee_amount: quote.fees?.fernFee.feeAmount || '0',
      fern_fee_usd_amount: quote.fees?.fernFee.feeUSDAmount || '0',
      developer_fee_amount: quote.fees?.developerFee.feeAmount || '0',
      developer_fee_usd_amount: quote.fees?.developerFee.feeUSDAmount || '0',
      expires_at: quote.expiresAt,
      raw_response: quote
    })
    .select('id, quote_id, created_at')
    .single();

    if (isDevelopment) {
      console.log('Cotización guardada en BD:', savedQuote);
    }

    if (saveError) {
      console.error('Error al guardar cotización:', saveError);
      // Don't throw - we still want to return the quote even if DB save fails
    }

    // Return successful response
    res.status(200).json(quote);

  } catch (error: any) {  
    console.error('Error al crear cotización en Fern:', error);
    
    // Handle specific error codes
    const errorMessages: { [key: string]: string } = {
      'CUSTOMER_ID_REQUIRED': 'El ID del cliente es requerido',
      'SOURCE_REQUIRED': 'Los datos de origen son requeridos',
      'DESTINATION_REQUIRED': 'Los datos de destino son requeridos',
      'SOURCE_PAYMENT_ACCOUNT_ID_REQUIRED': 'El ID de cuenta de pago de origen es requerido',
      'SOURCE_CURRENCY_REQUIRED': 'La moneda de origen es requerida',
      'SOURCE_PAYMENT_METHOD_REQUIRED': 'El método de pago de origen es requerido',
      'SOURCE_AMOUNT_REQUIRED': 'El monto de origen es requerido',
      'DESTINATION_PAYMENT_ACCOUNT_ID_REQUIRED': 'El ID de cuenta de pago de destino es requerido',
      'DESTINATION_CURRENCY_REQUIRED': 'La moneda de destino es requerida'
    };

    const errorMessage = errorMessages[error.message] || 'Error al crear la cotización';
    const statusCode = error.status || (errorMessages[error.message] ? 400 : 500);

    res.status(statusCode).json({
      error: errorMessage,
      details: error.details || error.message
    });
  }
};
