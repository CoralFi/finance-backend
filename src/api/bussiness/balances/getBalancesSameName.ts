import { Request, Response } from 'express';
import conduitFinancial from '@/services/conduit/conduit-financial';
import { AuthRequest } from "@/middleware/authMiddleware";

export const getBalancesSameController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // const { conduitId } = req.params;
    const conduitId = req.user?.conduit_id
    if (!conduitId) {
      return res.status(400).json({ success: false, message: 'conduitId es requerido en el path' });
    }
    console.log('test')
    const balances = await conduitFinancial.getBalanceSameName(conduitId);
    if (!balances || balances.length === 0) {
      throw new Error('No existen balances para este conduitId');
    }
    const mainAccount = {
      [balances[0].asset]: balances[0].amount,
    };
    const data = {
      "balanceTotal": balances[0].amount,
      mainAccount
    }
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error });
  }
};

