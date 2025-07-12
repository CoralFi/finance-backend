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
        // Log detailed error information
        console.error("Error en FernKycStatus:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            customerId: fernCustomerId,
            userId: userId
        });
        
        // Return a graceful error response instead of throwing
        return {
            kycStatus: null,
            kycLink: null,
            error: {
                message: error.response?.data?.message || error.message,
                status: error.response?.status || 'unknown'
            }
        };
    }
}

/**
 * Actualiza los datos KYC de un cliente en Fern
 * @param {string} fernCustomerId - ID del cliente en Fern
 * @param {object} kycData - Datos KYC a actualizar
 * @param {number|string} userId - ID local del usuario (opcional)
 * @returns {Promise<object>} - Resultado de la actualización
 */
export const FernKycUpdate = async (fernCustomerId, kycData, userId = null) => {
    try {
        // Verificar que tenemos un ID de cliente válido
        if (!fernCustomerId) {
            throw new Error('Se requiere un ID de cliente Fern válido');
        }

        // Verificar que tenemos datos KYC para actualizar
        if (!kycData || Object.keys(kycData).length === 0) {
            throw new Error('Se requieren datos KYC para actualizar');
        }

        // Realizar la solicitud PATCH para actualizar los datos KYC
        const requestBody = { kycData };
        console.log("Sending data to Fern:", JSON.stringify(requestBody, null, 2));
        
        // La API espera un objeto con la propiedad kycData
        const response = await axios.patch(
            `${FERN_API_BASE_URL}/customers/${fernCustomerId}`,
            requestBody,
            { headers: getAuthHeaders() }
        );

        // Obtener los datos actualizados del cliente
        const updatedCustomer = response.data;
        console.log("Response from Fern:", JSON.stringify(updatedCustomer, null, 2));
        
        // Verificar el estado del cliente después de la actualización
        const kycStatus = updatedCustomer.customerStatus === "ACTIVE" ? "APPROVED" : "PENDING";
        const kycLink = updatedCustomer.kycLink || null;
        
        // Si se proporciona userId, actualizar la información en la base de datos
        let dbResult = null;
        if (userId) {
            // Busca si ya existe registro para este user_id
            const { data: existing } = await supabase
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
        }
        
        return {
            success: true,
            customer: updatedCustomer,
            kycStatus,
            kycLink,
            dbResult
        };
    } catch (error) {
        // Log detailed error information
        console.error("Error en FernKycUpdate:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            customerId: fernCustomerId,
            userId: userId
        });
        
        // Return a graceful error response
        return {
            success: false,
            error: {
                message: error.response?.data?.message || error.message,
                status: error.response?.status || 'unknown',
                details: error.response?.data?.details || null
            }
        };
    }
}