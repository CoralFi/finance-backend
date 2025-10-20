import { Request, Response } from 'express';
import supabase from '../../db/supabase';

export const getCitiesByStateController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stateId = req.params.stateId as string;
    console.log('test stateId',stateId)
    if (!stateId) {
      return res.status(400).json({ error: 'Parámetro state requerido' });
    }
    const { data, error } = await supabase
      .from('cities')
      .select('id, name, state_code, country_code')
      .eq('state_id', stateId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
