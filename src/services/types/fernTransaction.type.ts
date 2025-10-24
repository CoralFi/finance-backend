

export type RampType = 'onramp' | 'offramp' | 'swap' | 'transfer' | 'unknown';
export type TransactionStatus = 'completed' | 'await' | 'processing' | 'failed' | '';

export interface TransactionSource {
  sourcePaymentMethod?: string;
  sourcePaymentAccountId?: string;
  amount?: string;
  currency?: string;
}

export interface TransactionDestination {
  destinationPaymentMethod?: string;
  destinationPaymentAccountId?: string;
  amount?: string;
  currency?: string;
}

export interface FernTransaction {
  transactionId: string;
  customerId: string;
  transactionStatus: string;
  source?: TransactionSource;
  destination?: TransactionDestination;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface FernTransactionWithRampType extends FernTransaction {
  rampType: RampType;
}

export interface FernTransactionsResponse {
  transactions: FernTransaction[];
  nextPageToken?: string;
}

export interface GetTransactionsParams {
  fernCustomerId: string;
  status?: TransactionStatus;
  pageSize?: number;
}