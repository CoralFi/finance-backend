import supabase from "@/db/supabase";
import { CustomerTotalInfo, RawCustomerData } from "@/services/types/customer.types";


const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Validate that customerId is a valid UUID
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Transform raw customer data from database to structured format
 */
const transformCustomerData = (customerData: RawCustomerData[]): CustomerTotalInfo | null => {
  if (!customerData || customerData.length === 0) {
    return null;
  }

  const customer = customerData[0];

  return {
    user: {
      firstName: customer?.name || null,
      lastName: customer?.last_name || null,
      email: customer?.email || null,
      verificatedEmail: customer?.verificated_email || false,
      phoneNumber: customer?.phone_number || null,
      birthDate: customer?.birth_date || null,
    },
    employmentStatus: {
      employmentStatus: customer?.employment_situation || null,
      esLabel: customer?.employment_situation_label || null,
      enLabel: customer?.employment_situation_label_en || null,
    },
    mostRecentOccupation: {
      occupationCode: customer?.occupation_code || null,
      occupationName: customer?.occupations || null,
      esLabel: customer?.occupation_label || null,
      enLabel: customer?.occupation_label_en || null,
    },
    sourceOfFunds: {
      sourceOfFunds: customer?.source_fund || null,
      esLabel: customer?.source_fund_label || null,
      enLabel: customer?.source_fund_label_en || null,
    },
    accountPurpose: {
      accountPurpose: customer?.account_purposes || null,
      esLabel: customer?.account_purposes_label || null,
      enLabel: customer?.account_purposes_label_en || null,
    },
    expectedMonthlyPaymentsUsd: {
      expectedMonthlyPaymentsUsd: customer?.amount_to_moved || null,
      esLabel: customer?.amount_to_moved_label || null,
      enLabel: customer?.amount_to_moved_label_en || null,
    },
    isIntermediary: false,
    fern: {
      fernCustomerId: customer?.fernCustomerId || null,
      fernWalletId: customer?.fernWalletId || null,
      kyc: customer?.Kyc || null,
      kycLink: customer?.KycLink || null,
    },
    // Indicator if user info is complete
    user_info: Boolean(
      customer?.employment_situation &&
      customer?.occupations &&
      customer?.source_fund &&
      customer?.account_purposes &&
      customer?.amount_to_moved &&
      customer?.country
    )
  };
};


/**
 * Get complete customer information by customer ID
 * 
 * @param customerId - Customer UUID
 * @returns Promise with customer total information
 * 
 * @throws Error if customerId is invalid
 * @throws Error if database query fails
 */
export const getCustomerTotalInfo = async (
  customerId: string
): Promise<CustomerTotalInfo> => {
  // Validate customer ID
  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    throw new Error('CUSTOMER_ID_REQUIRED: customerId is required');
  }

  if (!isValidUUID(customerId)) {
    throw new Error('INVALID_CUSTOMER_ID: customerId must be a valid UUID');
  }

  try {
    if (isDevelopment) {
      console.log(`🔄 Fetching customer info for: ${customerId}`);
    }

    // Call stored procedure
    const { data: customerData, error: customerError } = await supabase
      .rpc('get_user_info_by_customer_id', {
        p_customer_id: customerId
      });

    if (customerError) {
      console.error('❌ Supabase query error:', customerError);
      throw new Error(`DATABASE_ERROR: ${customerError.message}`);
    }

    if (isDevelopment) {
      console.log(`✅ Retrieved customer data`);
    }

    // Transform data
    const transformedData = transformCustomerData(customerData);

    if (!transformedData) {
      throw new Error('CUSTOMER_NOT_FOUND: Customer not found');
    }

    if (isDevelopment) {
      console.log(`✅ Customer ${customerId} found successfully`);
    }

    return transformedData;
  } catch (error: any) {
    if (isDevelopment) {
      console.error(`❌ Error getting customer info:`, error.message);
      console.error(error.stack);
    }
    throw error;
  }
};
