import { Request, Response } from 'express';
import { filterBalance } from './helpers/filterBalance';
import { AuthRequest } from "@/middleware/authMiddleware";

export const getBalancesController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    // const conduitId = req.params.conduitId as string;
    const conduitId = req.user?.conduit_id

    if (!conduitId) {
      return res.status(400).json({ success: false, message: 'Parámetro conduitId requerido' });
    }

    // Usar la función helper para calcular los balances
    const response = await filterBalance(conduitId);

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

