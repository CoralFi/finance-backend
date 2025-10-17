import { BalanceParams, FernBalanceResponse } from "@/services/types/fern.types";
import { fernApiRequest } from "./apiRequest";
// Constants
const SUPPORTED_CHAINS = {
  ETHEREUM: 'ETHEREUM',
  POLYGON: 'POLYGON',
  BASE: 'BASE'
} as const;

const SUPPORTED_CURRENCIES = {
  USDC: 'USDC',
  USDT: 'USDT',
  ETH: 'ETH'
} as const;

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
 * Validate balance request parameters
 */
const validateBalanceParams = (params: Partial<BalanceParams>): void => {
  const { paymentAccountId, chain, currency } = params;

  if (!isValidField(paymentAccountId)) {
    throw new Error('PAYMENT_ACCOUNT_ID_REQUIRED');
  }

  if (!isValidField(chain)) {
    throw new Error('CHAIN_REQUIRED');
  }

  if (!isValidField(currency)) {
    throw new Error('CURRENCY_REQUIRED');
  }
};



/**
 * Get payment account balance from Fern
 */
export const getFernBankAccountBalance = async (
  paymentAccountId: string,
  chain: string,
  currency: string
): Promise<FernBalanceResponse> => {
  try {
    // Validate parameters
    validateBalanceParams({ paymentAccountId, chain, currency });

    if (isDevelopment) {
      console.log('Fetching balance:', { paymentAccountId, chain, currency });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      chain,
      currency
    });

    // Make API request
    const data = await fernApiRequest<FernBalanceResponse>(
      `/payment-accounts/${paymentAccountId}/balance?${queryParams.toString()}`,
      { method: 'GET' }
    );

    if (isDevelopment) {
      console.log('Balance fetched:', { paymentAccountId, balance: data.balance });
    }

    return data;
  } catch (error: any) {
    console.error('Error getting payment account balance:', {
      paymentAccountId,
      chain,
      currency,
      error: error.message,
      status: error.status,
      stack: isDevelopment ? error.stack : undefined
    });
    throw error;
  }
};

/**
 * Export constants for external use
 */
export { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES };

