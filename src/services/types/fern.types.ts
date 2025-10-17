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



export interface ExternalBankAccount {
  bankAccountCurrency?: string | { label: string };
  bankName?: string;
  bankAccountType?: string;
  bankAddress?: string;
  bankAccountOwner?: string;
}

export interface ExternalCryptoWallet {
  cryptoWalletType?: string;
  chain?: string;
  address?: string;
}

export interface PaymentAccount {
  id?: string;
  paymentAccountType?: string;
  isThirdParty?: boolean;
  externalBankAccount?: ExternalBankAccount;
  externalCryptoWallet?: ExternalCryptoWallet;
  fernCryptoWallet?: any;
}

