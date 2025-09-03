import { setCorsHeaders } from '../../config.js';
import supabase from '../../supabase.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    if (req.method === 'GET') {

        const countryId = req.query.country;
        // console.log(countryId);
        try {
            const { data, error } = await supabase
                .from('states')
                .select('id, name, iso2 ')
                .eq('country_id', countryId);

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
