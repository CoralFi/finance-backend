import { Request, Response } from "express";
import { updateCustomerInfo } from "@/services/customer/customerInfoService";

/**
 * Interface for the POST request body
 */
interface UpdateCustomerInfoBody {
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
    address_line_2?: string;
    tax_number: string;
}

/**
 * Required fields for validation
 */
const REQUIRED_FIELDS = [
    'birth_date',
    'phone_number',
    'employment_status',
    'recent_occupation',
    'account_purpose',
    'funds_origin',
    'expected_amount',
    'country',
    'state_region_province',
    'city',
    'postal_code',
    'address_line_1'
] as const;

/**
 * Controller to handle POST request for updating customer info
 */
export const postCustomerInfoController = async (
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

        const {
            birth_date,
            phone_number,
            employment_status,
            recent_occupation,
            account_purpose,
            funds_origin,
            expected_amount,
            country,
            state_region_province,
            city,
            postal_code,
            address_line_1,
            address_line_2,
            tax_number,
        } = req.body as UpdateCustomerInfoBody;

        // Log received data for debugging
        console.log(`📝 Actualizando información para cliente ID: ${customerId}`);
        console.log('Datos recibidos:', {
            birth_date,
            phone_number,
            employment_status,
            recent_occupation,
            account_purpose,
            funds_origin,
            expected_amount,
            country,
            state_region_province,
            city,
            postal_code,
            address_line_1,
            address_line_2,
            tax_number,
        });

        // Validate required fields
        const receivedFields = {
            birth_date: !!birth_date,
            phone_number: !!phone_number,
            employment_status: employment_status !== undefined && employment_status !== null,
            recent_occupation: recent_occupation !== undefined && recent_occupation !== null,
            account_purpose: account_purpose !== undefined && account_purpose !== null,
            funds_origin: funds_origin !== undefined && funds_origin !== null,
            expected_amount: expected_amount !== undefined && expected_amount !== null,
            country: !!country,
            state_region_province: !!state_region_province,
            city: !!city,
            postal_code: !!postal_code,
            address_line_1: !!address_line_1,
            tax_number: !!tax_number,
        };

        const missingFields = REQUIRED_FIELDS.filter(field => !receivedFields[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos requeridos deben ser proporcionados',
                error: 'MISSING_REQUIRED_FIELDS',
                required: REQUIRED_FIELDS,
                missing: missingFields,
                received: receivedFields
            });
        }

        // Call service to update customer info
        const result = await updateCustomerInfo(customerId, {
            birth_date,
            phone_number,
            employment_status: parseInt(String(employment_status)),
            recent_occupation: parseInt(String(recent_occupation)),
            account_purpose: parseInt(String(account_purpose)),
            funds_origin: parseInt(String(funds_origin)),
            expected_amount: parseInt(String(expected_amount)),
            country,
            state_region_province,
            city,
            postal_code,
            address_line_1,
            address_line_2: address_line_2 || null,
            tax_number,
        });

        console.log(`✅ Información procesada exitosamente para cliente ${customerId}`);

        return res.status(200).json({
            success: true,
            message: 'Información del cliente actualizada exitosamente',
            data: {
                customerId: customerId,
                updated: true,
                timestamp: new Date().toISOString(),
                verification: result
            }
        });

    } catch (error: any) {
        console.error("❌ Error updating customer info:", error);

        // Handle specific error types
        if (error.message?.includes('INVALID_CUSTOMER_ID')) {
            return res.status(400).json({
                success: false,
                message: "ID de cliente inválido. Debe ser un UUID válido",
                error: "INVALID_CUSTOMER_ID"
            });
        }

        if (error.message?.includes('USER_NOT_FOUND')) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
                error: "USER_NOT_FOUND"
            });
        }

        if (error.message?.includes('DATABASE_ERROR')) {
            return res.status(500).json({
                success: false,
                message: "Error de base de datos al actualizar la información",
                error: "DATABASE_ERROR",
                details: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al actualizar la información del cliente",
            error: "INTERNAL_SERVER_ERROR"
        });
    }
};
