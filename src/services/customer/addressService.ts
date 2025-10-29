import supabase from "@/db/supabase";

const isDevelopment = process.env.NODE_ENV === 'development';

// Types
export interface AddressData {
    street_line_1: string;
    street_line_2?: string | null;
    city: string;
    state_region_province: string;
    postal_code: string;
    country: string;
    locale: string;
    tittle: string;
    first_name: string;
    last_name: string;
    email: string;
}

export interface Address extends AddressData {
    bank_account_owner_address_id: number;
    user_id: number;
    created_at: string;
}

export interface TransformedAddress {
    id: number;
    userId: number;
    streetLine1: string;
    streetLine2: string | null;
    city: string;
    stateRegionProvince: string;
    postalCode: string;
    country: string;
    locale: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
}

/**
 * Transform address data from database format to API format
 */
const transformAddressData = (address: Address): TransformedAddress => {
    return {
        id: address.bank_account_owner_address_id,
        userId: address.user_id,
        streetLine1: address.street_line_1,
        streetLine2: address.street_line_2 || null,
        city: address.city,
        stateRegionProvince: address.state_region_province,
        postalCode: address.postal_code,
        country: address.country,
        locale: address.locale,
        title: address.tittle,
        firstName: address.first_name,
        lastName: address.last_name,
        email: address.email,
        createdAt: address.created_at
    };
};

/**
 * Validate address data for required fields
 */
export const validateAddressData = (data: Partial<AddressData>): { isValid: boolean; missingFields?: string[] } => {
    const requiredFields: (keyof AddressData)[] = [
        'street_line_1', 'city', 'state_region_province', 'postal_code', 
        'country', 'locale', 'tittle', 'first_name', 'last_name', 'email'
    ];
    
    const missingFields = requiredFields.filter(field => {
        const value = data[field];
        return !value || (typeof value === 'string' && value.trim() === '');
    });
    
    if (missingFields.length > 0) {
        return { isValid: false, missingFields };
    }
    
    return { isValid: true };
};

/**
 * Get all addresses for a specific user
 * 
 * @param customerId - Customer ID
 * @returns Promise with array of transformed addresses
 * @throws Error if database query fails
 */
export const getCustomerAddresses = async (customerId: string): Promise<TransformedAddress[]> => {
    try {
        if (isDevelopment) {
            console.log(`🔄 Fetching addresses for user: ${customerId}`);
        }

        const { data: addresses, error } = await supabase
            .rpc('get_bank_account_owner_address', { p_customer_id: customerId });
            

        if (error) {
            console.error('❌ Error fetching addresses:', error);
            throw new Error(`DATABASE_ERROR: ${error.message}`);
        }

        const transformedAddresses = addresses?.map(transformAddressData) || [];
        
        if (isDevelopment) {
            console.log(`✅ Retrieved ${transformedAddresses.length} addresses`);
        }

        return transformedAddresses;
    } catch (error: any) {
        if (isDevelopment) {
            console.error(`❌ Error getting addresses:`, error.message);
        }
        throw error;
    }
};

/**
 * Create a new address for a user
 * 
 * @param userId - User ID
 * @param addressData - Address data to create
 * @returns Promise with created address
 * @throws Error if validation fails or database query fails
 */
export const createCustomerAddress = async (
    customerId: string, 
    addressData: AddressData
): Promise<TransformedAddress> => {
    try {
        // Validate data
        const validation = validateAddressData(addressData);
        if (!validation.isValid) {
            throw new Error(`VALIDATION_ERROR: Missing required fields: ${validation.missingFields?.join(', ')}`);
        }

        if (isDevelopment) {
            console.log(`🔄 Creating address for user: ${customerId}`);
        }

        const { data: newAddress, error } = await supabase
            .rpc('create_bank_account_owner_address', {
                p_customer_id: customerId,
                p_street_line_1: addressData.street_line_1,
                p_street_line_2: addressData.street_line_2,
                p_city: addressData.city,
                p_state_region_province: addressData.state_region_province,
                p_postal_code: addressData.postal_code,
                p_country: addressData.country,
                p_locale: addressData.locale,
                p_tittle: addressData.tittle,
                p_first_name: addressData.first_name,
                p_last_name: addressData.last_name,
                p_email: addressData.email
             })
            

        if (error) {
            console.error('❌ Error creating address:', error);
            throw new Error(`DATABASE_ERROR: ${error.message}`);
        }

        if (isDevelopment) {
            console.log(`✅ Address created successfully`);
        }

        return transformAddressData(newAddress[0]);
    } catch (error: any) {
        if (isDevelopment) {
            console.error(`❌ Error creating address:`, error.message);
        }
        throw error;
    }
};

/**
 * Delete an address for a user
 * 
 * @param userId - User ID
 * @param addressId - Address ID to delete
 * @returns Promise<void>
 * @throws Error if database query fails
 */
export const deleteCustomerAddress = async (
    customerId: string, 
    addressId: number
): Promise<void> => {
    try {
        if (isDevelopment) {
            console.log(`🔄 Deleting address ${addressId} for user: ${customerId}`);
        }

        const { error } = await supabase
            .rpc('delete_bank_account_owner_address', {
                p_customer_id: customerId,
                p_bank_account_owner_address_id: addressId
            });
        
        if (error) {
            console.error('❌ Error deleting address:', error);
            throw new Error(`DATABASE_ERROR: ${error.message}`);
        }

        if (isDevelopment) {
            console.log(`✅ Address deleted successfully`);
        }
    } catch (error: any) {
        if (isDevelopment) {
            console.error(`❌ Error deleting address:`, error.message);
        }
        throw error;
    }
};
