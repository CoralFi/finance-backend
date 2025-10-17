// Fern API Types

export interface FernCustomerData {
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export interface FernWalletData {
  paymentAccountType: string;
  customerId: string;
  fernCryptoWallet: {
    cryptoWalletType: string;
  };
}

export interface FernCustomerResponse {
  customerId: string;
  customerStatus: string;
  kycLink?: string;
  organizationId?: string;
}

export interface FernRecord {
  fernCustomerId: string;
  fernWalletId: string;
  KycLink: string | null;
  Kyc: string;
  user_id: string;
  businessName?: string;
  organizationId?: string;
}

export interface CreateFernCustomerResult extends FernRecord {
  kycLink: string | null;
  kycStatus: string;
  fernWalletAddress?: string;
}

// Fern Wallet Crypto Info
export interface FernWalletCryptoInfo {
  fernCryptoWallet: {
    address: string;
    cryptoWalletType: string;
  };
  paymentAccountId: string;
  customerId: string;
}

// Payment Account Balance
export interface BalanceParams {
  paymentAccountId: string;
  chain: string;
  currency: string;
}

export interface FernBalanceResponse {
  balance: string;
  currency: {
    chain: string;
    label: string;
  };
  usdValue: string;
  paymentAccountId?: string;
  [key: string]: any;
}

export interface FernApiError extends Error {
  status?: number;
  details?: any;
}
