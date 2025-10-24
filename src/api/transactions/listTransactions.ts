import { Router, Request, Response } from "express";
import { FernTransactions } from "@/services/fern/transactionsFern";
import { TransactionStatus } from "@/services/types/fernTransaction.type";

export const listTransactionsController = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const { fernCustomerId, status, pageSize } = req.query;

        // Validate required parameter
        if (!fernCustomerId || typeof fernCustomerId !== 'string' || fernCustomerId.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "fernCustomerId is required",
                error: "CUSTOMER_ID_REQUIRED"
            });
        }

        // Parse pageSize with default value
        const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : 20;
        if (isNaN(parsedPageSize) || parsedPageSize < 1) {
            return res.status(400).json({
                success: false,
                message: "pageSize must be a positive number",
                error: "INVALID_PAGE_SIZE"
            });
        }

        // Fetch transactions
        const fernTransactions = await FernTransactions(
            fernCustomerId,
            (status as TransactionStatus) || '',
            parsedPageSize
        );

        return res.status(200).json({
            transactions: fernTransactions,
        });
    } catch (error: any) {
        console.error("❌ Error listing transactions:", error);

        // Handle specific error types
        if (error.message?.includes('INVALID_STATUS')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                error: "INVALID_STATUS"
            });
        }

        if (error.status) {
            return res.status(error.status).json({
                success: false,
                message: error.message || "Error fetching transactions from Fern API",
                error: "FERN_API_ERROR",
                details: error.details
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while listing transactions",
            error: "INTERNAL_SERVER_ERROR"
        });
    }
};
