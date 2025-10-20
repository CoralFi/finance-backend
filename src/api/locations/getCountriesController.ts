import { Request, Response } from 'express';
import supabase from '../../db/supabase';

export const getCountriesController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { data, error } = await supabase
      .from('country')
      .select('id, name, iso2, iso3');

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
