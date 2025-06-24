import { FERN_API_BASE_URL, getAuthHeaders } from "../../api/v2/config.js";
import supabase from "../../api/v2/supabase.js";

import axios from "axios";

/**
 * Obtiene el estado KYC de un usuario en Fern y lo guarda/actualiza en Supabase.
 * @param {string} fernCustomerId - ID del cliente en Fern
 * @param {number|string} userId - ID local del usuario
 * @returns {Promise<object>} - Estado KYC y datos relevantes
 */
export const FernKycStatus = async (fernCustomerId, userId) => {
    try {
        // 1. Obtener estado del cliente en Fern
        const response = await axios.get(
            `${FERN_API_BASE_URL}/customers/${fernCustomerId}`, 
            { headers: getAuthHeaders() }
        );
        const fernData = response.data;
        //console.log("Fern data:", fernData);
        const kycStatus = fernData.customerStatus === "ACTIVE" ? "APPROVED" : "PENDING";
        const kycLink = fernData.kycLink || fernData.kyc?.kycLink || null;

        // Busca si ya existe registro para este user_id
        const { data: existing, error: fetchError } = await supabase
            .from('fern')
            .select('*')
            .eq('user_id', userId)
            .single();

        let upsertData = {
            user_id: userId,
            fernCustomerId,
            Kyc: kycStatus,
            KycLink: kycLink
        };

        let dbResult;
        if (existing) {
            // Actualiza
            const { data, error } = await supabase
                .from('fern')
                .update(upsertData)
                .eq('user_id', userId)
                .select();
            dbResult = { data, error };
        } else {
            // Inserta
            const { data, error } = await supabase
                .from('fern')
                .insert(upsertData)
                .select();
            dbResult = { data, error };
        }

        console.log("Fern data updated:", dbResult);

        return {
            fern: fernData,
            kycStatus,
            kycLink,
            dbResult
        };
    } catch (error) {
        console.error("Error en FernKycStatus:", error.response?.data || error.message);
        throw error;
    }
}