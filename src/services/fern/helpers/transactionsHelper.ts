import {
    RampType,
    TransactionStatus,
    FernTransaction,
    FernTransactionWithRampType,
} from "@/services/types/fernTransaction.type";

export const FIAT_METHODS = [
    'ACH',
    'WIRE',
    'SEPA',
    'SWIFT',
    'AR_TRANSFERS_3',
    'MX_SPEI',
    'BR_TED_DOC_PIX',
    'CA_INTERAC',
    'GB_BACS_CHAPS_FPS',
    'AU_BECS'
] as const;

export const CRYPTO_NETWORKS = [
    'BASE',
    'POLYGON',
    'ETHEREUM',
    'ARBITRUM',
    'OP_MAINNET',
    'SOLANA',
    'TRON',
    'BITCOIN'
] as const;

export const VALID_STATUSES: TransactionStatus[] = [
    'completed',
    'await',
    'processing',
    'failed',
    ''
];

/**
 * Validate that a field is not empty (null, undefined, or empty string)
 */
export const isValidField = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
};

/**
 * Validate transaction status
 */
export const isValidStatus = (status: string): status is TransactionStatus => {
    return VALID_STATUSES.includes(status as TransactionStatus);
};

/**
 * Determine the ramp type of a transaction based on source and destination
 */
export const getRampType = (tx: FernTransaction): RampType => {
    const sourceMethod = tx.source?.sourcePaymentMethod;
    const destMethod = tx.destination?.destinationPaymentMethod;
    const sourceAccountId = tx.source?.sourcePaymentAccountId;
    const destAccountId = tx.destination?.destinationPaymentAccountId;

    // Check for swap (same payment account)
    if (sourceAccountId && destAccountId && sourceAccountId === destAccountId) {
        return 'swap';
    }

    // Check for onramp (fiat → crypto)
    if (sourceMethod && destMethod &&
        FIAT_METHODS.includes(sourceMethod as any) &&
        CRYPTO_NETWORKS.includes(destMethod as any)) {
        return 'onramp';
    }

    // Check for offramp (crypto → fiat)
    if (sourceMethod && destMethod &&
        CRYPTO_NETWORKS.includes(sourceMethod as any) &&
        FIAT_METHODS.includes(destMethod as any)) {
        return 'offramp';
    }

    // Check for crypto transfer (crypto → crypto, different accounts)
    if (sourceMethod && destMethod &&
        CRYPTO_NETWORKS.includes(sourceMethod as any) &&
        CRYPTO_NETWORKS.includes(destMethod as any)) {
        return 'transfer';
    }

    return 'unknown';
};

/**
 * Filter transactions by status
 */
export const filterByStatus = (
    transactions: FernTransactionWithRampType[],
    status: TransactionStatus
): FernTransactionWithRampType[] => {
    if (status === '') return transactions;

    return transactions.filter(tx =>
        tx.transactionStatus &&
        tx.transactionStatus.toLowerCase().includes(status.toLowerCase())
    );
};

