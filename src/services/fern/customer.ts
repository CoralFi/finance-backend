import { FERN_API_BASE_URL, getAuthHeaders } from "@/config/fern/config";
import supabase from "@/db/supabase";
import { getFernWalletCryptoInfo } from "./wallet";
import { UserRecord } from "@/types/user.types";
import { 
  FernCustomerData, 
  FernWalletData, 
  FernCustomerResponse, 
  FernRecord, 
  CreateFernCustomerResult 
} from "@/services/types/fern.types";

// Constants
const CUSTOMER_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL' as const,
  BUSINESS: 'BUSINESS' as const
};

const WALLET_TYPES = {
  EVM: 'EVM' as const
};

const PAYMENT_ACCOUNT_TYPES = {
  FERN_CRYPTO_WALLET: 'FERN_CRYPTO_WALLET' as const
};

const KYC_STATUS = {
  ACTIVE: 'ACTIVE' as const,
  APPROVED: 'APPROVED' as const
};

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
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * HTTP request helper with consistent error handling
 */
const fernApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(`${FERN_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(
        errorData.message || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Fern API request failed: ${error.message}`);
  }
};

/**
 * Validate customer data before creating a Fern record
 */
const validateCustomerData = (user: UserRecord): void => {
  const requiredFields: (keyof UserRecord)[] = ['user_id', 'email', 'nombre', 'apellido', 'user_type'];
  const missingFields = requiredFields.filter(field => !isValidField(user[field]));
  
  if (missingFields.length > 0) {
    throw new Error(`MISSING_REQUIRED_FIELDS: ${missingFields.join(', ')}`);
  }

  if (!isValidEmail(user.email)) {
    throw new Error('INVALID_EMAIL_FORMAT');
  }
};

/**
 * Create a Fern wallet for an existing customer
 */
export const createFernWallet = async (
  customerId: string,
  cryptoWalletType: string = WALLET_TYPES.EVM
): Promise<string> => {
  if (!isValidField(customerId)) {
    throw new Error('CUSTOMER_ID_REQUIRED');
  }

  try {
    const walletData: FernWalletData = {
      paymentAccountType: PAYMENT_ACCOUNT_TYPES.FERN_CRYPTO_WALLET,
      customerId,
      fernCryptoWallet: { cryptoWalletType }
    };

    const data = await fernApiRequest<{ paymentAccountId: string }>(
      '/payment-accounts',
      {
        method: 'POST',
        body: JSON.stringify(walletData)
      }
    );

    if (isDevelopment) {
      console.log('✅ Wallet created:', { walletId: data.paymentAccountId, customerId });
    }

    return data.paymentAccountId;
  } catch (error: any) {
    console.error('❌ Error creating wallet:', error.message);
    throw new Error(`WALLET_CREATION_FAILED: ${error.message}`);
  }
};

/**
 * Create a new Fern customer with associated wallet
 */
export const createFernCustomer = async (
  user: UserRecord
): Promise<CreateFernCustomerResult> => {
  try {
    // Validate input data
    validateCustomerData(user);

    const isIndividual = user.user_type === 'persona';

    // 1. Create customer in Fern
    const customerData: FernCustomerData = {
      customerType: isIndividual ? CUSTOMER_TYPES.INDIVIDUAL : CUSTOMER_TYPES.BUSINESS,
      email: user.email,
      firstName: isIndividual ? user.nombre : undefined,
      lastName: isIndividual ? user.apellido : undefined,
      businessName: !isIndividual ? user.nombre : undefined,
    };

    if (isDevelopment) {
      console.log('🔄 Creating Fern customer:', { email: user.email });
    }

    const fernCustomerResponse = await fernApiRequest<FernCustomerResponse>(
      '/customers',
      {
        method: 'POST',
        body: JSON.stringify(customerData)
      }
    );

    const customerId = fernCustomerResponse.customerId;

    if (isDevelopment) {
      console.log('✅ Customer created in Fern:', { customerId });
    }

    // 2. Create wallet for the customer
    const walletId = await createFernWallet(customerId);
    
    // 3. Save to local database
    const fernRecord: FernRecord = {
      fernCustomerId: customerId,
      fernWalletId: walletId,
      KycLink: fernCustomerResponse.kycLink || null,
      Kyc: fernCustomerResponse.customerStatus !== KYC_STATUS.ACTIVE 
        ? fernCustomerResponse.customerStatus 
        : KYC_STATUS.APPROVED,
      user_id: user.user_id,
      businessName: !isIndividual ? user.nombre : undefined,
      organizationId: fernCustomerResponse.organizationId,
    };

    const { data: insertedData, error } = await supabase
      .from('fern')
      .insert(fernRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`DATABASE_ERROR: ${error.message}`);
    }

    if (isDevelopment) {
      console.log('✅ Fern record saved:', { userId: user.user_id, customerId });
    }

    // 4. Get wallet crypto info
    const fernWalletCryptoInfo = await getFernWalletCryptoInfo(walletId);

    return {
      ...fernRecord,
      kycLink: fernRecord.KycLink,
      kycStatus: fernRecord.Kyc,
      fernWalletAddress: fernWalletCryptoInfo?.fernCryptoWallet?.address,
    };

  } catch (error: any) {
    console.error('❌ Error in createFernCustomer:', {
      error: error.message,
      userId: user?.user_id,
      email: user?.email,
      stack: isDevelopment ? error.stack : undefined
    });
    
    // Safe error message for production
    const safeMessage = isDevelopment 
      ? error.message 
      : 'Error creating customer in payment system';
        
    throw new Error(safeMessage);
  }
};

/**
 * Get a Fern customer by ID
 */
export const getFernCustomer = async (
  customerId: string
): Promise<FernCustomerResponse | null> => {
  if (!isValidField(customerId)) {
    throw new Error('CUSTOMER_ID_REQUIRED');
  }

  try {
    const response = await fetch(`${FERN_API_BASE_URL}/customers/${customerId}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error fetching customer:', { customerId, error: error.message });
    throw error;
  }
};
