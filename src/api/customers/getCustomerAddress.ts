import { Request, Response } from "express";
import { 
    getCustomerAddresses, 
    createCustomerAddress, 
    deleteCustomerAddress,
    AddressData
} from "@/services/customer/addressService";

/**
 * GET /api/customers/:customerId/addresses - Get all addresses for a customer
 * POST /api/customers/:customerId/addresses - Create a new address for a customer
 * DELETE /api/customers/:customerId/addresses - Delete an address for a customer
 */
export const customerAddressController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { customerId } = req.params;

        // Validate customerId
        if (!customerId || isNaN(parseInt(customerId))) {
            return res.status(400).json({
                success: false,
                message: 'ID de cliente inválido',
                data: null
            });
        }

        // Handle GET request - Fetch all addresses
        if (req.method === 'GET') {
            const addresses = await getCustomerAddresses(customerId);
            
            return res.status(200).json({
                success: true,
                message: 'Direcciones obtenidas exitosamente',
                data: { addresses }
            });
        }

        // Handle POST request - Create new address
        if (req.method === 'POST') {
            const { 
                street_line_1, 
                street_line_2, 
                city, 
                state_region_province, 
                postal_code, 
                country, 
                locale, 
                tittle, 
                first_name, 
                last_name, 
                email 
            } = req.body;

            // Quick validation for required fields
            if (!street_line_1?.trim() || !city?.trim() || !state_region_province?.trim() || 
                !postal_code?.trim() || !country?.trim() || !locale?.trim() || !tittle?.trim() ||
                !first_name?.trim() || !last_name?.trim() || !email?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes',
                    data: null
                });
            }

            const addressData: AddressData = {
                street_line_1,
                street_line_2,
                city,
                state_region_province,
                postal_code,
                country,
                locale,
                tittle,
                first_name,
                last_name,
                email
            };

            const newAddress = await createCustomerAddress(customerId, addressData);
            
            return res.status(201).json({
                success: true,
                message: 'Dirección creada exitosamente',
                data: { address: newAddress }
            });
        }

        // Handle DELETE request - Delete address
        if (req.method === 'DELETE') {
            const { addressId } = req.body;

            if (!addressId || isNaN(parseInt(addressId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de dirección inválido',
                    data: null
                });
            }

            await deleteCustomerAddress(customerId, parseInt(addressId));
            
            return res.status(200).json({
                success: true,
                message: 'Dirección eliminada exitosamente',
                data: null
            });
        }

        // Method not allowed
        return res.status(405).json({
            success: false,
            message: 'Método no permitido',
            data: null
        });

    } catch (error: any) {
        console.error('❌ Unexpected error in address API:', error);

        // Handle specific error types
        if (error.message?.includes('VALIDATION_ERROR')) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                error: error.message,
                data: null
            });
        }

        if (error.message?.includes('DATABASE_ERROR')) {
            return res.status(500).json({
                success: false,
                message: 'Error al procesar la solicitud en la base de datos',
                error: 'DATABASE_ERROR',
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            data: null
        });
    }
};
