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
/**
 * Data structure for updating customer info
 */
export interface UpdateCustomerInfoData {
  birth_date: string;
  phone_number: string;
  employment_status: number;
  recent_occupation: number;
  account_purpose: number;
  funds_origin: number;
  expected_amount: number;
  country: string;
  state_region_province: string;
  city: string;
  postal_code: string;
  address_line_1: string;
  address_line_2: string | null;
}

/**
 * Update or insert customer information
 * 
 * @param customerId - Customer UUID
 * @param data - Customer info data to update
 * @returns Promise with the updated customer data
 * 
 * @throws Error if customerId is invalid
 * @throws Error if user not found
 * @throws Error if database operation fails
 */
export const updateCustomerInfo = async (
  customerId: string,
  data: UpdateCustomerInfoData
): Promise<any> => {
  // Validate customer ID
  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    throw new Error('CUSTOMER_ID_REQUIRED: customerId is required');
  }

  if (!isValidUUID(customerId)) {
    throw new Error('INVALID_CUSTOMER_ID: customerId must be a valid UUID');
  }

  try {
    if (isDevelopment) {
      console.log(`🔄 Updating customer info for: ${customerId}`);
    }

    // Verify if user exists in usuarios table
    const { data: userExists, error: userCheckError } = await supabase
      .from('usuarios')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (userCheckError) {
      console.error('❌ Error verifying user:', userCheckError);
      throw new Error('USER_NOT_FOUND: User not found');
    }

    // Check if user_info record already exists
    const { data: existingInfo, error: infoCheckError } = await supabase
      .from('user_info')
      .select('user_id')
      .eq('user_id', userExists.user_id)
      .single();

    let result;

    if (infoCheckError && infoCheckError.code === 'PGRST116') {
      // No record exists, create a new one
      if (isDevelopment) {
        console.log(`📝 Creating new user_info record for user ${customerId}`);
      }

      const { data: insertResult, error: insertError } = await supabase
        .from('user_info')
        .insert({
          user_id: userExists.user_id,
          birthdate: data.birth_date,
          phone_number: data.phone_number,
          employment_situation_id: data.employment_status,
          occupation_id: data.recent_occupation,
          account_purposes_id: data.account_purpose,
          source_fund_id: data.funds_origin,
          amount_to_moved_id: data.expected_amount,
          country: data.country,
          state_region_province: data.state_region_province,
          city: data.city,
          postal_code: data.postal_code,
          address_line_1: data.address_line_1,
          address_line_2: data.address_line_2,
        })
        .select();

      if (insertError) {
        console.error('❌ Error inserting user_info:', insertError);
        throw new Error(`DATABASE_ERROR: ${insertError.message}`);
      }

      result = insertResult;
      if (isDevelopment) {
        console.log('✅ Record created successfully:', insertResult);
      }

    } else if (infoCheckError) {
      // Unexpected error
      console.error('❌ Error checking existing user_info:', infoCheckError);
      throw new Error(`DATABASE_ERROR: ${infoCheckError.message}`);

    } else {
      // Record exists, update using RPC
      if (isDevelopment) {
        console.log(`📝 Updating existing record for user ${customerId}`);
      }

      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('update_user_info', {
          p_user_id: customerId,
          p_birth_date: data.birth_date,
          p_phone_number: data.phone_number,
          p_employment_status_id: data.employment_status,
          p_recent_occupation_id: data.recent_occupation,
          p_account_purpose_id: data.account_purpose,
          p_funds_origin_id: data.funds_origin,
          p_expected_amount_id: data.expected_amount,
          p_country: data.country,
          p_state_region_province: data.state_region_province,
          p_city: data.city,
          p_postal_code: data.postal_code,
          p_address_line_1: data.address_line_1,
          p_address_line_2: data.address_line_2,
        });

      if (rpcError) {
        console.error('❌ Error in RPC update:', rpcError);
        throw new Error(`DATABASE_ERROR: ${rpcError.message}`);
      }

      result = rpcResult;
      if (isDevelopment) {
        console.log('✅ RPC update result:', rpcResult);
      }
    }

    // Verify the operation was successful by fetching updated data
    const { data: verificationData, error: verifyError } = await supabase
      .rpc('get_user_info_by_customer_id', {
        p_customer_id: customerId
      });

    if (verifyError) {
      console.warn('⚠️ Could not verify update:', verifyError);
    } else if (isDevelopment) {
      console.log('✅ Verification successful - updated data:', verificationData?.[0]);
    }

    return verificationData?.[0] || result;

  } catch (error: any) {
    if (isDevelopment) {
      console.error(`❌ Error updating customer info:`, error.message);
      console.error(error.stack);
    }
    throw error;
  }
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
