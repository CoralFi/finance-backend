import { Request, Response } from "express";
import supabase from "@/db/supabase";
import { FernKycStatus } from "@/services/fern/fernServices";

/**
 * Controller to get KYC status for a customer
 * GET /api/customers/kyc/:customerId/status
 */
export const getKycStatusController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { customerId } = req.params;

        // Validate customerId parameter
        if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "customerId es requerido como parámetro de ruta",
                error: "CUSTOMER_ID_REQUIRED"
            });
        }


        const { data: userExists, error: userCheckError } = await supabase
            .from('usuarios')
            .select('user_id')
            .eq('customer_id', customerId)
            .single();

        if (userCheckError) {
            console.error('❌ Error verifying user:', userCheckError);
            throw new Error('USER_NOT_FOUND: User not found');
        }

        // Get fern data for the customer
        const { data: existing, error: fetchError } = await supabase
            .from('fern')
            .select('*')
            .eq('user_id', userExists.user_id)
            .single();

        if (fetchError) {
            console.error('❌ Error fetching fern data:', fetchError);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el estado del cliente',
                error: 'FERN_FETCH_ERROR',
                details: fetchError.message
            });
        }

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'No se encontraron datos de Fern para este cliente',
                error: 'FERN_DATA_NOT_FOUND'
            });
        }

        // Get KYC status from Fern
        const response = await FernKycStatus(existing.fernCustomerId, existing.user_id);

        // Get didit KYC data (provisional)
        const { data: didit_data, error: didit_error } = await supabase
            .from('kyc_didit')
            .select('*')
            .eq('user_id', userExists.user_id)
            .single();

        if (didit_error) {
            console.log("ℹ️ User doesn't have kyc_didit data");
        }

        // Check if user info exists
        const { data: user_info_data, error: user_info_error } = await supabase
            .rpc("user_info_exists", {
                p_user_id: userExists.user_id
            });

        if (user_info_error) {
            console.error("❌ Error checking user info:", user_info_error);
            return res.status(500).json({
                success: false,
                message: "Error al verificar información del usuario",
                error: "USER_INFO_CHECK_ERROR",
                details: user_info_error.message
            });
        }

        console.log(`✅ KYC status retrieved for customer: ${customerId}`);

        return res.status(200).json({
            success: true,
            message: 'Estado del cliente obtenido exitosamente',
            data: {
                ...response,
                ...didit_data,
                user_info: user_info_data
            }
        });

    } catch (error: any) {
        console.error('❌ Error getting KYC status:', error);

        return res.status(500).json({
            success: false,
            message: 'Error al obtener el estado del cliente',
            error: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
