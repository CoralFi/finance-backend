import { Request, Response } from 'express';
import supabase from '../../db/supabase';

export const getStatesByCountryController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const countryId = req.params.countryId as string;
    console.log('test',countryId)
    if (!countryId) {
      return res.status(400).json({ error: 'Parámetro country requerido' });
    }
    const { data, error } = await supabase
      .from('states')
      .select('id, name, iso2')
      .eq('country_id', countryId);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
