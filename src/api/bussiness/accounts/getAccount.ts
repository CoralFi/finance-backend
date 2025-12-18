import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const getAccountController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const data = await conduitFinancial.getAccount(id);
    return res.status(200).json({
      success: true,
      message: 'Account retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving Account', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Account',
      error: error.message || error,
    });
  }
};
