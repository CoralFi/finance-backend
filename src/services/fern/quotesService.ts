import { QuoteRequestData, FernQuoteResponse } from "@/services/types/fern.types";
import { fernApiRequest } from "./apiRequest";

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
 * Validate quote request data
 */
const validateQuoteRequest = (data: Partial<QuoteRequestData>): void => {
  // Validate required top-level fields
  if (!isValidField(data.customerId)) {
    throw new Error('CUSTOMER_ID_REQUIRED');
  }

  if (!data.source) {
    throw new Error('SOURCE_REQUIRED');
  }

  if (!data.destination) {
    throw new Error('DESTINATION_REQUIRED');
  }

  // Validate source fields
  const { source } = data;
  if (!isValidField(source.sourcePaymentAccountId)) {
    throw new Error('SOURCE_PAYMENT_ACCOUNT_ID_REQUIRED');
  }
  if (!isValidField(source.sourceCurrency)) {
    throw new Error('SOURCE_CURRENCY_REQUIRED');
  }
  if (!isValidField(source.sourcePaymentMethod)) {
    throw new Error('SOURCE_PAYMENT_METHOD_REQUIRED');
  }
  if (!isValidField(source.sourceAmount)) {
    throw new Error('SOURCE_AMOUNT_REQUIRED');
  }

  // Validate destination fields
  const { destination } = data;
  if (!isValidField(destination.destinationPaymentAccountId)) {
    throw new Error('DESTINATION_PAYMENT_ACCOUNT_ID_REQUIRED');
  }
  if (!isValidField(destination.destinationCurrency)) {
    throw new Error('DESTINATION_CURRENCY_REQUIRED');
  }
};

/**
 * Create a quote in Fern API
 * @param quoteData - Quote request data
 * @returns Promise with the created quote response
 */
export const createFernQuote = async (
  quoteData: QuoteRequestData
): Promise<FernQuoteResponse> => {
  try {
    // Validate request data
    validateQuoteRequest(quoteData);

    if (isDevelopment) {
      console.log('🔄 Creating quote:', {
        customerId: quoteData.customerId,
        sourceAmount: quoteData.source.sourceAmount,
        sourceCurrency: quoteData.source.sourceCurrency,
        destinationCurrency: quoteData.destination.destinationCurrency
      });
    }

    // Build request payload
    const payload: QuoteRequestData = {
      customerId: quoteData.customerId,
      source: {
        sourcePaymentAccountId: quoteData.source.sourcePaymentAccountId,
        sourceCurrency: quoteData.source.sourceCurrency,
        sourcePaymentMethod: quoteData.source.sourcePaymentMethod,
        sourceAmount: quoteData.source.sourceAmount
      },
      destination: {
        destinationPaymentAccountId: quoteData.destination.destinationPaymentAccountId,
        destinationCurrency: quoteData.destination.destinationCurrency,
        destinationPaymentMethod: quoteData.destination.destinationPaymentMethod || 'BASE'
      }
    };

    // Add developer fee if present
    if (quoteData.developerFee && isValidField(quoteData.developerFee.developerFeeAmount)) {
      payload.developerFee = {
        developerFeeType: quoteData.developerFee.developerFeeType || 'USD',
        developerFeeAmount: quoteData.developerFee.developerFeeAmount
      };
    }

    // Make API request
    const response = await fernApiRequest<FernQuoteResponse>(
      '/quotes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (isDevelopment) {
      console.log('✅ Quote created:', {
        quoteId: response.quoteId,
        exchangeRate: response.exchangeRate
      });
    }

    return response;
  } catch (error: any) {
    console.error('❌ Error creating quote:', {
      customerId: quoteData.customerId,
      error: error.message,
      status: error.status,
      stack: isDevelopment ? error.stack : undefined
    });
    throw error;
  }
};
