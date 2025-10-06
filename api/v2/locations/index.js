import { setCorsHeaders } from '../config.js';
import supabase from '../supabase.js';
export default async function handler (req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('country')
                .select('id, name, iso2, iso3');

            if (error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(200).json({ data });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}