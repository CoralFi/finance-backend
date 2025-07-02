import { FERN_API_BASE_URL, getAuthHeaders, getAuthHeaders2 } from "../../api/v2/config.js";

export const handleDeleteBankAccount = async (paymentAccountId) => {
    const url = `${FERN_API_BASE_URL}/payment-accounts/${paymentAccountId}`;
    const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers,
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const error = new Error('Failed to delete payment account from Fern');
            error.status = response.status;
            error.details = errorData;
            throw error;
        }

        if (response.status === 204 || response.status === 200) {
            return { success: true, message: 'Payment account deleted successfully.' };
        }
        
        return await response.json();

    } catch (error) {
        console.error(`Error deleting payment account ${paymentAccountId} from Fern:`, error.message);
        throw error;
    }
};

export const getFernBankAccountBalance = async (paymentAccountId, chain, currency) => {
    const url = `${FERN_API_BASE_URL}/payment-accounts/${paymentAccountId}/balance?chain=${chain}&currency=${currency}`;
    const headers = {
        ...getAuthHeaders2(),
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const error = new Error('Failed to get payment account balance from Fern');
            error.status = response.status;
            error.details = errorData;
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error getting payment account balance ${paymentAccountId} from Fern:`, error.message);
        throw error;
    }
};
