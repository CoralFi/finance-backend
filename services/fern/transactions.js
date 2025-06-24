import { FERN_API_BASE_URL, getAuthHeaders } from "../../api/v2/config.js";

/**
 * Get Fern transactions (onramp/offramp) for a user, pending or accepted
 * @param {string} fernCustomerId - Fern customer ID
 * @returns {Promise<Array>} - List of transactions
 */
function getRampType(tx) {
    const fiatMethods = ["ACH", "WIRE", "SEPA", "SWIFT", "BANK_TRANSFER"];
    const cryptoNetworks = ["BASE", "POLYGON", "ETHEREUM", "ARBITRUM", "OP_MAINNET", "SOLANA", "TRON", "BITCOIN"];
    const sourceMethod = tx.source?.sourcePaymentMethod;
    const destMethod = tx.destination?.destinationPaymentMethod;
    if (fiatMethods.includes(sourceMethod) && cryptoNetworks.includes(destMethod)) {
        return "onramp";
    }
    if (cryptoNetworks.includes(sourceMethod) && fiatMethods.includes(destMethod)) {
        return "offramp";
    }
    return "unknown";
}

export const FernTransactions = async (fernCustomerId) => {
    try {
        // 1. Llamar a la API de Fern para obtener transacciones
        const response = await fetch(
            `${FERN_API_BASE_URL}/transactions?customerId=${fernCustomerId}`,
            { headers: getAuthHeaders() }
        );

        if (!response.ok) {
            throw new Error(`Error al obtener transacciones: ${response.statusText}`);
        }

        const { transactions = [] } = await response.json();

        // Agregar campo rampType a cada transacción
        const withRampType = transactions.map(tx => ({
            ...tx,
            rampType: getRampType(tx)
        }));

        return withRampType;
    } catch (error) {
        console.error('Error obteniendo transacciones de Fern:', error.message);
        throw error;
    }
}
;