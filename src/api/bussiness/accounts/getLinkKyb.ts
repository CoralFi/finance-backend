import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { AuthRequest } from "@/middleware/authMiddleware";

export const linkKyb = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const conduitId = req.user?.conduit_id
    console.log(conduitId)
    const data = await conduitFinancial.getLinkKyb(conduitId);
    return res.status(200).json({
      success: true,
      message: 'KYB link retrieved successfully',
      data,
    });
  } catch (error: any) {
    console.error('Error retrieving Account', error.response.data);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Account',
      error: error.response.data || error,
    });
  }
};
