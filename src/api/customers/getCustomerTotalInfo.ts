import { Request, Response } from "express";
import { getCustomerTotalInfo } from "@/services/customer/customerInfoService";

export const getCustomerTotalInfoController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { customerId } = req.params;

        // Validate customerId parameter
        if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "customerId is required as a route parameter",
                error: "CUSTOMER_ID_REQUIRED"
            });
        }

        // Fetch customer total info
        const customerTotalInfo = await getCustomerTotalInfo(customerId);

        return res.status(200).json({
            success: true,
            message: "Customer information retrieved successfully",
            data: customerTotalInfo
        });
    } catch (error: any) {
        console.error("❌ Error getting customer total info:", error);

        // Handle specific error types
        if (error.message?.includes('INVALID_CUSTOMER_ID')) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID format. Must be a valid UUID",
                error: "INVALID_CUSTOMER_ID"
            });
        }

        if (error.message?.includes('CUSTOMER_NOT_FOUND')) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
                error: "CUSTOMER_NOT_FOUND"
            });
        }

        if (error.message?.includes('DATABASE_ERROR')) {
            return res.status(500).json({
                success: false,
                message: "Database error while fetching customer information",
                error: "DATABASE_ERROR",
                details: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while getting customer information",
            error: "INTERNAL_SERVER_ERROR"
        });
    }
};
