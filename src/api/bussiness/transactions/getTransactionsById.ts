import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const getTransactionController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const data = await conduitFinancial.getTransaction(id);
    return res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving Transaction', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Transaction',
      error: error.message || error,
    });
  }
};
