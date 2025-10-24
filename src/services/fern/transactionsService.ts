import { CreateTransactionRequest, FernTransactionResponse } from "@/services/types/fern.types";
import { fernApiRequest } from "./apiRequest";
import { v4 as uuidv4 } from 'uuid';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Validate that a field is not empty (null, undefined, or empty string)
 */
const isValidField = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

/**
 * Validate transaction request data
 */
const validateTransactionRequest = (data: Partial<CreateTransactionRequest>): void => {
  if (!isValidField(data.quoteId)) {
    throw new Error('QUOTE_ID_REQUIRED');
  }
};

/**
 * Create a transaction in Fern API
 * @param quoteId - The quote ID to create a transaction from
 * @returns Promise with the created transaction response
 */
export const createFernTransaction = async (
  quoteId: string
): Promise<FernTransactionResponse> => {
  try {
    // Validate request data
    validateTransactionRequest({ quoteId });

    // Generate unique idempotency key
    const idempotencyKey = uuidv4();

    if (isDevelopment) {
      console.log('🔄 Creating transaction:', {
        quoteId,
        idempotencyKey
      });
    }

    // Make API request with idempotency key
    const response = await fernApiRequest<FernTransactionResponse>(
      '/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify({ quoteId })
      }
    );

    if (isDevelopment) {
      console.log('✅ Transaction created:', {
        transactionId: response.transactionId,
        status: response.status
      });
    }

    return response;
  } catch (error: any) {
    console.error('❌ Error creating transaction:', {
      quoteId,
      error: error.message,
      status: error.status,
      details: error.details,
      stack: isDevelopment ? error.stack : undefined
    });
    throw error;
  }
};
