/**
 * Conduit Webhook Types
 * Based on Conduit API documentation
 */

// Transaction Status Types
export type TransactionStatus =
  | 'CREATED'
  | 'IN_COMPLIANCE_REVIEW'
  | 'AWAITING_COMPLIANCE_REVIEW'
  | 'COMPLIANCE_APPROVED'
  | 'COMPLIANCE_REJECTED'
  | 'AWAITING_FUNDS'
  | 'FUNDS_RECEIVED'
  | 'PROCESSING_WITHDRAWAL'
  | 'WITHDRAWAL_PROCESSED'
  | 'PROCESSING_SETTLEMENT'
  | 'SETTLEMENT_PROCESSED'
  | 'PROCESSING_PAYMENT'
  | 'PAYMENT_PROCESSED'
  | 'COMPLETED'
  | 'CANCELLED';

// Transaction Event Types
export type TransactionEventType =
  | 'transaction.created'
  | 'transaction.compliance_approved'
  | 'transaction.compliance_rejected'
  | 'transaction.completed'
  | 'transaction.awaiting_funds'
  | 'transaction.funds_received'
  | 'transaction.cancelled'
  | 'transaction.in_compliance_review'
  | 'transaction.awaiting_compliance_review'
  | 'transaction.processing_withdrawal'
  | 'transaction.withdrawal_processed'
  | 'transaction.processing_settlement'
  | 'transaction.settlement_processed'
  | 'transaction.processing_payment'
  | 'transaction.payment_processed';

// Counterparty Status Types
export type CounterpartyStatus =
  | 'active'
  | 'in_compliance_review'
  | 'compliance_rejected'
  | 'deleted';

// Counterparty Event Types
export type CounterpartyEventType =
  | 'counterparty.active'
  | 'counterparty.compliance_rejected'
  | 'counterparty.deleted'
  | 'counterparty.in_compliance_review';

// Customer Event Types
export type CustomerEventType =
  | 'customer.active'
  | 'customer.in_compliance_review'
  | 'customer.compliance_rejected'
  | 'customer.created'
  | 'customer.kyb_in_progress'
  | 'customer.kyb_expired'
  | 'customer.kyb_missing_information'
  | 'customer.account_onboarding_pending';

// All Event Types
export type ConduitEventType = TransactionEventType | CounterpartyEventType | CustomerEventType;

// Transaction Amount Interface
export interface TransactionAmount {
  assetType: string;
  decimals: number;
  standardDecimals: number;
  amount: string;
  assetTypeNetwork?: {
    assetType: string;
    networkId: string;
  };
}

// Transaction Source/Destination Interface
export type TransactionAmountPayload = TransactionAmount | string | number;

export interface TransactionEndpoint {
  id?: string;
  address?: string;
  amount: TransactionAmountPayload;
  asset?: string;
  network?: string;
}

// Transaction Data Interface
export interface TransactionData {
  type: 'deposit' | 'withdrawal' | 'offramp' | 'onramp' | 'conversion' | 'transfer';
  id: string;
  status: TransactionStatus;
  source: TransactionEndpoint;
  destination: TransactionEndpoint;
  purpose?: string | null;
  reference?: string | null;
  quote?: string | null;
  createdAt: string;
  completedAt?: string | null;
  clientId: string;
}

// Counterparty Data Interface
export interface CounterpartyData {
  id: string;
  type: 'business' | 'individual';
  businessName?: string;
  website?: string;
  address?: any;
  paymentMethods?: any[];
  documents?: any[];
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

// Customer Data Interface
export interface CustomerData {
  id: string;
  type: 'business' | 'individual';
  businessLegalName?: string;
  businessTradeName?: string | null;
  industry?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  [key: string]: any;
}

// Generic Webhook Payload
export interface ConduitWebhookPayload<T = any> {
  event: ConduitEventType;
  version: string;
  data: T;
}

// Transaction Webhook Payload
export interface TransactionWebhookPayload extends ConduitWebhookPayload<{ transaction: TransactionData }> {
  event: TransactionEventType;
}

// Counterparty Webhook Payload
export interface CounterpartyWebhookPayload extends ConduitWebhookPayload<{ counterparty: CounterpartyData }> {
  event: CounterpartyEventType;
}

// Customer Webhook Payload
export interface CustomerWebhookPayload extends ConduitWebhookPayload<{ customer: CustomerData }> {
  event: CustomerEventType;
}

// Webhook Headers
export interface ConduitWebhookHeaders {
  'conduit-signature': string;
  'conduit-signature-timestamp': string;
  'conduit-webhook-idempotency-key'?: string;
}
