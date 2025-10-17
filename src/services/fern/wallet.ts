import { FERN_API_BASE_URL, getAuthHeaders } from "@/config/fern/config";

/**
 * Obtain fern wallet crypto info
 * @param {string} paymentAccountId - ID de la cuenta de pago
 * @returns {Promise<Object>} Datos de la cuenta de pago
 */
export const getFernWalletCryptoInfo = async (paymentAccountId: string) => {
    try {
        if (!paymentAccountId) {
            throw new Error('Payment account ID is required');
        }

        const response = await fetch(`${FERN_API_BASE_URL}/payment-accounts/${paymentAccountId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error fetching Fern payment account:', { 
            paymentAccountId, 
            error: error.message,
            status: error.response?.status || 'unknown',
            data: error.response?.data
        });
        
        // Return null instead of throwing to allow the login process to continue
        return null;
    }
};