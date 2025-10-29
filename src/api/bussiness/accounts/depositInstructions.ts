import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';

export const depositInstructionsController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { data } = await conduitFinancial.depositInstructions(id);
    return res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving customers', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers',
      error: error.message || error,
    });
  }
};
