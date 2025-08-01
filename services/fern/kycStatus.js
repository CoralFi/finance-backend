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
        const kycStatus = fernData.customerStatus === "ACTIVE" ? "APPROVED" : fernData.customerStatus;
        const kycLink = fernData.kycLink || fernData.kyc?.kycLink || null;

        // Busca si ya existe registro para este user_id
        const { data: existing, error: fetchError } = await supabase
            .from('fern')
            .select('*')
            .eq('user_id', userId)
            .single();

        console.log("Existing data:", existing);

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
            console.log("Updated data:", dbResult);
        } else {
            // Inserta
            const { data, error } = await supabase
                .from('fern')
                .insert(upsertData)
                .select();
            dbResult = { data, error };
            console.log("Inserted data:", dbResult);
        }

        console.log("Fern data updated:", dbResult);

        return {
            fern: fernData,
            kycStatus,
            kycLink
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

        // Preparar los datos para enviar
        const requestBody = {
            kycData: {
                legalFirstName: kycData.legalFirstName,
                legalLastName: kycData.legalLastName,
                phoneNumber: kycData.phoneNumber,
                dateOfBirth: kycData.dateOfBirth,
                address: {
                    streetLine1: kycData.address.streetLine1,
                    city: kycData.address.city,
                    stateRegionProvince: kycData.address.stateRegionProvince,
                    postalCode: kycData.address.postalCode,
                    countryCode: kycData.address.countryCode,
                },
                taxIdNumber: kycData.taxIdNumber,
                documents: [{
                    type: kycData.documents[0].type,
                    subtype: kycData.documents[0].subtype,
                    countryCode: kycData.documents[0].countryCode,
                    documentIdNumber: kycData.documents[0].documentIdNumber,
                    issuanceDate: kycData.documents[0].issuanceDate,
                    expirationDate: kycData.documents[0].expirationDate,
                    frontIdImage: kycData.documents[0].frontIdImage,
                    backIdImage: kycData.documents[0].backIdImage,
                },
                {
                    type: kycData.documents[1].type,
                    subtype: kycData.documents[1].subtype,
                    description: kycData.documents[1].description,
                    countryCode: kycData.documents[1].countryCode,
                    proofOfAddressImage: kycData.documents[1].proofOfAddressImage,
                },
                ],
                employmentStatus: kycData.employmentStatus,
                mostRecentOccupation: kycData.mostRecentOccupation,
                sourceOfFunds: kycData.sourceOfFunds,
                accountPurpose: kycData.accountPurpose,
                expectedMonthlyPaymentsUsd: kycData.expectedMonthlyPaymentsUsd,
                isIntermediary: kycData.isIntermediary,
            }
        };

        // Intentar hacer la solicitud con fetch primero para poder ver la respuesta completa
        try {
            console.log("Enviando solicitud a Fern API...");
            
            // Usar fetch para poder ver la respuesta completa
            const response = await fetch(`${FERN_API_BASE_URL}/customers/${fernCustomerId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(requestBody)
            });
            
            // Mostrar el estado de la respuesta
            console.log(`Estado de la respuesta HTTP: ${response.status} ${response.statusText}`);
            
            // Obtener el texto completo de la respuesta
            const responseText = await response.text();
            console.log("Respuesta completa de Fern (texto):", responseText);
            
            // Intentar parsear la respuesta como JSON
            let responseData = null;
            try {
                if (responseText && responseText.trim()) {
                    responseData = JSON.parse(responseText);
                    console.log("Respuesta de Fern (JSON):", JSON.stringify(responseData, null, 2));
                }
            } catch (parseError) {
                console.error("Error al parsear la respuesta como JSON:", parseError.message);
                console.log("La respuesta no es un JSON válido");
            }
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
            }
            
            // Si llegamos aquí, la solicitud fue exitosa
            const updatedCustomer = responseData;
            
            // Verificar el estado del cliente después de la actualización
            const kycStatus = updatedCustomer && updatedCustomer.customerStatus === "ACTIVE" ? "APPROVED" : updatedCustomer.customerStatus;
            const kycLink = updatedCustomer && updatedCustomer.kycLink ? updatedCustomer.kycLink : null;
            
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
            console.log("DB result:", dbResult);
            
            return {
                success: true,
                customer: updatedCustomer,
                kycStatus,
                kycLink,
                dbResult,
                responseText: responseText // Incluir el texto completo de la respuesta
            };
            
        } catch (error) {
            // Mostrar información detallada del error
            console.error("Error en la solicitud a Fern API:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                customerId: fernCustomerId,
                userId: userId
            });
            
            // Devolver una respuesta de error estructurada con toda la información disponible
            return {
                success: false,
                error: {
                    message: error.response?.data?.message || error.message,
                    status: error.response?.status || 'unknown',
                    details: error.response?.data?.details || null,
                    kycData: requestBody,
                    fullError: error.toString(),
                    stack: error.stack
                }
            };
        }
    } catch (outerError) {
        // Capturar cualquier error no manejado en el bloque try principal
        console.error("Error no manejado en FernKycUpdate:", outerError);
        return {
            success: false,
            error: {
                message: outerError.message,
                stack: outerError.stack,
                kycData: requestBody
            }
        };
    }
}