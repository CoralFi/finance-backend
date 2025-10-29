import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const listAccountsController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = await conduitFinancial.listAccounts();
    return res.status(200).json({
      success: true,
      message: 'Accounts retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving Accounts', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Accounts',
      error: error.message || error,
    });
  }
};
