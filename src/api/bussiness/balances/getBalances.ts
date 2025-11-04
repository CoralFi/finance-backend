import { Request, Response } from 'express';
import supabase from '../../../db/supabase';

export const getBalancesController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const conduitId = req.params.conduitId as string;
    if (!conduitId) {
      return res.status(400).json({ success: false, message: 'Parámetro conduitId requerido' });
    }

    const { data, error } = await supabase
      .from('conduit_transactions')
      .select('source_asset, source_network, source_amount, transaction_type, status')
      .eq('conduit_id', conduitId);

    if (error) {
      return res.status(500).json({ success: false, message: 'Error al obtener datos', error: error.message });
    }

    const balances: Record<string, Record<string, number>> = {};
    let balanceTotal = 0;

    data?.forEach(tx => {
      if (!tx.status || tx.status.toLowerCase() !== 'completed') return;

      const network = tx.source_network ? tx.source_network.toUpperCase() : 'BANKS';
      const asset = tx.source_asset?.toUpperCase() || 'UNKNOWN';
      const amount = Number(tx.source_amount) || 0;
      const sign = tx.transaction_type === 'offramp' ? -1 : 1;

      if (!balances[network]) balances[network] = {};
      if (!balances[network][asset]) balances[network][asset] = 0;

      balances[network][asset] += amount * sign;
      balanceTotal += amount * sign;
    });

    const response = {
      balanceTotal: Number(balanceTotal.toFixed(2)),
      ...balances,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

