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


// Individual Customer KYCdata
export interface FernCustomerKYC {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: {
    streetLine1: string;
    streetLine2?: string;
    city: string;
    stateRegionProvince: string;
    postalCode: string;
    countryCode: string;
    locale?: string;
  };
  nationalIdIssuingCountry?: string;
  nationalIdType: string;
  nationalIdNumber: string;
  nationality: string;
  employmentStatus: string;
  mostRecentOccupation: string;
  sourceOfFunds: string;
  accountPurpose: string;
  accountPurposeOther?: string;
  expectedMonthlyPaymentsUsd: string;
  isIntermediary: boolean;
  documents: [
    {
      type: string;
      frontIdImage: string;
      backIdImage: string;
      proofOfAddressImage: string;
      documentImage: string;
    }
  ];
}

// Individual customer object
export interface FernCustomer {
  customerId: string;
  name?: string;
  email?: string;
  customerStatus: string;
  customerType?: string;
  updatedAt?: string;
  kycLink?: string;
  organizationId?: string;
  kycData?: FernCustomerKYC;
}

// Response when creating/getting a single customer
export interface FernCustomerResponse extends FernCustomer {
  // Single customer response includes all FernCustomer fields
}

// Response when listing multiple customers
export interface FernCustomersListResponse {
  customers: FernCustomer[];
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
  bankAccountCurrency?: {
    label: string;
  };
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

// Quote Types
export interface QuoteSource {
  sourcePaymentAccountId: string;
  sourceCurrency: string;
  sourcePaymentMethod: string;
  sourceAmount: string;
}

export interface QuoteDestination {
  destinationPaymentAccountId: string;
  destinationCurrency: string;
  destinationPaymentMethod?: string;
}

export interface DeveloperFee {
  developerFeeType?: string;
  developerFeeAmount: string;
}

export interface QuoteRequestData {
  customerId: string;
  source: QuoteSource;
  destination: QuoteDestination;
  developerFee?: DeveloperFee;
}

export interface FernQuoteResponse {
  quoteId: string;
  customerId: string;
  source: QuoteSource;
  destination: QuoteDestination;
  developerFee?: DeveloperFee;
  exchangeRate?: string;
  estimatedFees?: any;
  expiresAt?: string;
  [key: string]: any;
}

// Transaction Types
export interface CreateTransactionRequest {
  quoteId: string;
}

export interface FernTransactionResponse {
  transactionId: string;
  quoteId: string;
  customerId: string;
  status: string;
  source?: QuoteSource;
  destination?: QuoteDestination;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
