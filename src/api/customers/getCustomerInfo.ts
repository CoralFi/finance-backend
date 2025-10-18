import { Request, Response } from "express";
import { getFernCustomer } from "@/services/fern/customer";

export const getCustomerInfo = async (req: Request, res: Response) => {
    try {
        const customerId = req.params.customerId;
        const customer = await getFernCustomer(customerId);
        res.status(200).json({ 
            message: 'Customer info fetched successfully',
            data: customer
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Failed to fetch customer info',
            error: error });
    }
};
    