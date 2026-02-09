import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { AuthRequest } from "@/middleware/authMiddleware";

export const getCustomerByIdController = async (req: AuthRequest, res: Response): Promise<Response> => {
  // const { id } = req.params;
  const id = req.user?.conduit_id
  console.log(id)
  try {
    const data = await conduitFinancial.getCustomer(id);
    return res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: data,
    });
  } catch (error: any) {
    console.error('Error retrieving customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer',
      error: error.message || error,
    });
  }
};
