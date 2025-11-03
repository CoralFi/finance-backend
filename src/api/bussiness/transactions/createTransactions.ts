import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';

const isDevelopment = process.env.NODE_ENV === 'development';
/**
 * Create a new transaction 
 *{
 *  "type": "withdrawal",
 *  "destination":
 *     {
 *        "walletId":"wlt_34nnOseuR0AVKwRdgkHaUlax7YY",
 *        "asset":"USDT",
 *        "network":"ethereum",
 *        "amount":"10.00"
 *     }
 *}
 * ESTA PIDE UNA QUOTE COMO ESTA 
 * {
 * "source": {
 *    "amount": "10.00",
 *   "asset": "USD"
 * },
 * "target": {
 *   "asset": "USDT",
 *   "network": "ethereum"
 * }
 *}
 * PUEDE SER WALLET O CUENTA BANCARIA, NO COMPRENDO MUY BIEN 
 * {
 * "type": "onramp",
 * "quote": "quote_34qYtbnwvNia7Y3gaj8QmtW9Mi5",
 * "source": "bank_34nPOhgCsRj7YSWiTowI8cTRKOZ",
 * "destination": "bank_34nnOv4g8oH2R24DJrilY2qo82L",
 * "purpose": "InterCompanyTransfer",
 * "documents": [
 *   "doc_34nkRui71EevJnkZVjmHQtAgaYb"
 * ]
 *}
 * 
 */
export const createTransactionController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { type } = req.body;


    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Field 'type' is required (withdrawal, offramp, onramp, conversion, transfer)"
      });
    }
    switch (type) {
      case 'withdrawal': {
        const { destination } = req.body;
        if (
          !destination ||
          !destination.walletId ||
          !destination.asset ||
          !destination.network ||
          !destination.amount
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields for 'withdrawal': destination.walletId, destination.asset, destination.network, destination.amount"
          });
        }
        break;
      }

      case 'offramp':
      case 'onramp':
      case 'conversion':
      case 'transfer': {
        const { quote, source, destination, purpose, documents } = req.body;
        if (!quote || !source || !destination || !purpose || !Array.isArray(documents) || !documents.length) {
          return res.status(400).json({
            success: false,
            message: `Missing required fields for '${type}': quote, source, destination, purpose, documents[]`
          });
        }
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: `Invalid type '${type}'. Must be one of: withdrawal, offramp, onramp, conversion, transfer`
        });
    }

    const data = await conduitFinancial.createTransacions(req.body);

    if (isDevelopment) {
      console.log('Transacción creada en Conduit:', data);
    }

    // Save transaction in database
    const { data: savedTransaction, error: saveError } = await supabase
      .from('conduit_transactions')
      .insert({
        transaction_id: data.id,
        quote_id: data.quote || null,
        transaction_type: data.type,
        status: data.status,
        source_id: data.source.id,
        source_asset: data.source.asset,
        source_network: data.source.network || null,
        source_amount: data.source.amount,
        destination_id: data.destination.id,
        destination_asset: data.destination.asset,
        destination_network: data.destination.network || null,
        destination_amount: data.destination.amount,
        onramp_instructions: data.onrampInstructions || null,
        documents: data.documents || null,
        purpose: data.purpose || null,
        reference: data.reference || null,
        conduit_created_at: data.createdAt,
        raw_response: data,
      })
      .select('id, transaction_id, created_at')
      .single();

    if (isDevelopment) {
      console.log('Transacción guardada en BD:', savedTransaction);
    }

    if (saveError) {
      console.error('Error al guardar transacción:', saveError);
      // Don't throw - we still want to return the transaction even if DB save fails
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data,
    });
  } catch (error: any) {

    console.error('data Enviada: ', error.response.config.data);
    console.error('headers Enviados: ', error.response.request._header);
    console.error('message Recibido', error.response.data)
    return res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.response.data || error.message || error,
    });
  }
};
