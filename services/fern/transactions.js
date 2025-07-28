import { FERN_API_BASE_URL, getAuthHeaders } from "../../api/v2/config.js";

/**
 * Get Fern transactions (onramp/offramp) for a user, pending or accepted
 * @param {string} fernCustomerId - Fern customer ID
 * @returns {Promise<Array>} - List of transactions
 */
function getRampType(tx) {
    const fiatMethods = ["ACH", "WIRE", "SEPA", "SWIFT", "AR_TRANSFERS_3"];
    const cryptoNetworks = ["BASE", "POLYGON", "ETHEREUM", "ARBITRUM", "OP_MAINNET", "SOLANA", "TRON", "BITCOIN"];
    const sourceMethod = tx.source?.sourcePaymentMethod;
    const destMethod = tx.destination?.destinationPaymentMethod;
    if (fiatMethods.includes(sourceMethod) && cryptoNetworks.includes(destMethod)) {
        return "onramp";
    }
    if (cryptoNetworks.includes(sourceMethod) && fiatMethods.includes(destMethod)) {
        return "offramp";
    }
    if (cryptoNetworks.includes(sourceMethod) && cryptoNetworks.includes(destMethod)) {
        return "";
    }
    return "unknown";
}

export const FernTransactions = async (fernCustomerId, status = "") => {
        
    const statusList = ["completed", "await", "processing", "failed", ""];

    if (!statusList.includes(status)) {
        throw new Error("Invalid status");
    }

    try {
        // 1. Llamar a la API de Fern para obtener transacciones
        const response = await fetch(
            `${FERN_API_BASE_URL}/transactions?customerId=${fernCustomerId}&pageSize=20`,
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

        if (status !== "") {
            return withRampType.filter(tx =>
                tx.transactionStatus &&
                tx.transactionStatus.toLowerCase().includes(status.toLowerCase())
            );
        }

        return withRampType;
    } catch (error) {
        console.error('Error obteniendo transacciones de Fern:', error.message);
        throw error;
    }
}
;

