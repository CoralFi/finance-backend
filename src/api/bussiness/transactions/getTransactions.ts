import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
export const listTransactionsController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await conduitFinancial.listTransactions();
    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving Transactions', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Transactions',
      error: error.message || error,
    });
  }
};
