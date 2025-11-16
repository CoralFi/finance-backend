// =====================================================
// Conduit Payment Methods Types
// =====================================================

/**
 * Tipos de métodos de pago soportados
 */
export type PaymentMethodType = 'bank' | 'wallet';

/**
 * Estados de un método de pago
 */
export type PaymentMethodStatus = 'enabled' | 'disabled' | 'pending';

/**
 * Tipos de cuenta bancaria
 */
export type BankAccountType = 'savings' | 'checking' | 'electronic_deposit';

/**
 * Rails/redes soportadas para transferencias bancarias
 */
export type BankRail = 
  | 'fedwire' 
  | 'ach' 
  | 'wire' 
  | 'sepa' 
  | 'swift' 
  | 'pix' 
  | 'spei';

/**
 * Rails/redes soportadas para wallets crypto
 */
export type WalletRail = 
  | 'tron' 
  | 'ethereum' 
  | 'polygon' 
  | 'bitcoin' 
  | 'stellar';

/**
 * Monedas fiat soportadas
 */
export type FiatCurrency = 
  | 'USD' 
  | 'MXN' 
  | 'BRL' 
  | 'COP' 
  | 'EUR' 
  | 'NGN' 
  | 'ARS' 
  | 'GBP';

/**
 * Criptomonedas soportadas
 */
export type CryptoCurrency = 
  | 'USDT' 
  | 'USDC' 
  | 'BTC' 
  | 'ETH';

/**
 * Dirección asociada a un método de pago
 */
export interface PaymentMethodAddress {
  streetLine1: string;
  streetLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Información de la entidad asociada
 */
export interface EntityInfo {
  id: string;
  name: string;
  entityType: 'individual' | 'business';
  complianceEntityType: 'customer' | 'counterparty';
}

/**
 * Request para crear un método de pago tipo Bank Account
 */
export interface CreateBankPaymentMethodRequest {
  type: 'bank';
  currency: FiatCurrency;
  rail: BankRail[];
  bankName: string;
  accountOwnerName: string;
  accountNumber: string;
  accountType: BankAccountType;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  branchCode?: string;
  bankCode?: string;
  sortCode?: string;
  pixKey?: string;
  address?: PaymentMethodAddress;
}

/**
 * Request para crear un método de pago tipo Wallet
 */
export interface CreateWalletPaymentMethodRequest {
  type: 'wallet';
  rail: WalletRail;
  walletAddress: string;
  walletLabel?: string;
  currency?: CryptoCurrency;
}

/**
 * Union type para crear cualquier tipo de método de pago
 */
export type CreatePaymentMethodRequest = 
  | CreateBankPaymentMethodRequest 
  | CreateWalletPaymentMethodRequest;

/**
 * Response de Conduit para un Bank Payment Method
 */
export interface BankPaymentMethodResponse {
  id: string;
  type: 'bank';
  rail: BankRail[];
  bankName: string;
  accountOwnerName: string;
  accountNumber: string;
  accountType: BankAccountType;
  currency: FiatCurrency;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  branchCode?: string;
  bankCode?: string;
  sortCode?: string;
  pixKey?: string;
  status: PaymentMethodStatus;
  address?: PaymentMethodAddress;
  entity: EntityInfo;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response de Conduit para un Wallet Payment Method
 */
export interface WalletPaymentMethodResponse {
  id: string;
  type: 'wallet';
  rail: WalletRail;
  walletAddress: string;
  walletLabel?: string;
  currency?: CryptoCurrency;
  status: PaymentMethodStatus;
  entity: EntityInfo;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Union type para response de cualquier tipo de método de pago
 */
export type PaymentMethodResponse = 
  | BankPaymentMethodResponse 
  | WalletPaymentMethodResponse;

/**
 * Modelo de base de datos para payment methods
 */
export interface PaymentMethodDB {
  id: string;
  payment_method_id: string;
  customer_id: string;
  counterparty_id?: string;
  type: PaymentMethodType;
  status: PaymentMethodStatus;
  
  // Bank fields
  bank_name?: string;
  account_owner_name?: string;
  account_number?: string;
  account_type?: BankAccountType;
  routing_number?: string;
  swift_code?: string;
  iban?: string;
  branch_code?: string;
  bank_code?: string;
  sort_code?: string;
  pix_key?: string;
  
  // Wallet fields
  wallet_address?: string;
  wallet_label?: string;
  
  // Common fields
  rail: BankRail[] | WalletRail;
  currency?: string;
  address?: PaymentMethodAddress;
  entity_info?: EntityInfo;
  metadata?: Record<string, any>;
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
  conduit_created_at?: Date;
  conduit_updated_at?: Date;
}

/**
 * Response para listar métodos de pago
 */
export interface ListPaymentMethodsResponse {
  success: boolean;
  message: string;
  count: number;
  paymentMethods: PaymentMethodResponse[];
}

/**
 * Response para obtener un método de pago
 */
export interface GetPaymentMethodResponse {
  success: boolean;
  message: string;
  paymentMethod: PaymentMethodResponse;
}

/**
 * Response para crear un método de pago
 */
export interface CreatePaymentMethodResponse {
  success: boolean;
  message: string;
  paymentMethod: PaymentMethodResponse;
}

/**
 * Filtros para listar métodos de pago
 */
export interface PaymentMethodFilters {
  customerId?: string;
  type?: PaymentMethodType;
  status?: PaymentMethodStatus;
  currency?: string;
}
