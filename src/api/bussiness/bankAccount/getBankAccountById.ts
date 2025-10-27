import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const getBankAccountsByIdController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'id es requerido en el path',
    });
  }
  try {
    const bankAccount = await conduitFinancial.getBankAccountsById(id);
    return res.status(200).json({
      success: true,
      message: 'Bank accounts filtered by id',
      data: bankAccount,
    });
  } catch (error: any) {
    console.error('Error retrieving bank accounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bank accounts',
      error: error.message || error,
    });
  }
};
