import { Request, Response } from 'express';
// import conduitFinancial from '@/services/conduit/conduit-financial';
import supabase from '@/db/supabase';
import { AuthRequest } from '@/middleware/authMiddleware';
export const listTransactionsController = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {

    // const { customer_id } = req.params;
    const customer_id = req.user?.conduit_id
    // this returned conduit transactions from conduit but there is a issue conduit dont send the conduit_id
    // to identify the customer
    // const data = await conduitFinancial.listTransactions();
    // return res.status(200).json({
    //   success: true,
    //   message: 'Transactions retrieved successfully',
    //   data,
    // });
    // return res.status(200).json({
    //   success: true,
    //   message: 'Transactions retrieved successfully',
    //   data: [],
    // });

    // we will return conduit transactions from our database
    const { data, error } = await supabase
      .from('conduit_transactions')
      .select(`
      transaction_id,
      quote_id,
      transaction_type,
      status,
      source_id,
      source_asset,
      source_network,
      source_amount,
      destination_id,
      destination_asset,
      destination_network,
      destination_amount,
      onramp_instructions,
      documents,
      purpose,
      reference,
      created_at,
      updated_at,
      conduit_created_at,
      completed_at,
      conduit_id,
      wallet_address
    `)
      .eq('conduit_id', customer_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: data || [],
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
