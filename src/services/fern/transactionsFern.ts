import { fernApiRequest } from "./apiRequest";
import {
    isValidField,
    isValidStatus,
    getRampType,
    filterByStatus,
    FIAT_METHODS,
    CRYPTO_NETWORKS,
    VALID_STATUSES
} from "./helpers/transactionsHelper";
import {
    TransactionStatus,
    FernTransactionWithRampType,
    FernTransactionsResponse,
} from "../types/fernTransaction.type";



const DEFAULT_PAGE_SIZE = 20;

const isDevelopment = process.env.NODE_ENV === 'development';


/**
 * Get Fern transactions for a customer with optional status filtering
 * 
 * @param fernCustomerId - Fern customer ID
 * @param status - Optional transaction status filter (completed, await, processing, failed, or empty string for all)
 * @param pageSize - Number of transactions to retrieve (default: 20)
 * @returns Promise with array of transactions including rampType
 * 
 * @throws Error if customerId is invalid
 * @throws Error if status is invalid
 * @throws FernApiError if API request fails
 */
export const FernTransactions = async (
    fernCustomerId: string,
    status: TransactionStatus = '',
    pageSize: number = DEFAULT_PAGE_SIZE
): Promise<FernTransactionWithRampType[]> => {
    // Validate customer ID
    if (!isValidField(fernCustomerId)) {
        throw new Error('CUSTOMER_ID_REQUIRED: fernCustomerId is required');
    }

    // Validate status
    if (!isValidStatus(status)) {
        throw new Error(
            `INVALID_STATUS: Status must be one of: ${VALID_STATUSES.join(', ')}`
        );
    }

    try {
        if (isDevelopment) {
            console.log(`🔄 Fetching transactions for customer: ${fernCustomerId}`);
            if (status) console.log(`   Filter by status: ${status}`);
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            customerId: fernCustomerId,
            pageSize: pageSize.toString()
        });

        // Fetch transactions from Fern API
        const response = await fernApiRequest<FernTransactionsResponse>(
            `/transactions?${queryParams.toString()}`
        );

        const { transactions = [] } = response;

        if (isDevelopment) {
            console.log(`✅ Retrieved ${transactions.length} transactions`);
        }

        // Add rampType to each transaction
        const withRampType: FernTransactionWithRampType[] = transactions.map(tx => ({
            ...tx,
            rampType: getRampType(tx)
        }));

        // Filter by status if specified
        const filtered = filterByStatus(withRampType, status);

        if (isDevelopment && status) {
            console.log(`✅ Filtered to ${filtered.length} transactions with status: ${status}`);
        }

        return filtered;
    } catch (error: any) {
        // Only log in development (already logged in fernApiRequest)
        if (!isDevelopment) {
            console.error('❌ Error getting Fern transactions:', error.message);
        }
        throw error;
    }
};


export { FIAT_METHODS, CRYPTO_NETWORKS, VALID_STATUSES };
