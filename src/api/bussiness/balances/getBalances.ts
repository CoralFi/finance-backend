import { Request, Response } from 'express';
import supabase from '../../../db/supabase';
import { filterBalance } from './helpers/filterBalance';

export const getBalancesController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const conduitId = req.params.conduitId as string;
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

