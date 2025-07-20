import supabase from "../../supabase.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    if (req.method === 'GET') {

        const {lenguage} = req.query;

        try {
            const { data, error } = await supabase.rpc('get_active_employment_situations');

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            //order data alphabetically by lenguage
            if (lenguage === 'es') {
                data.sort((a, b) => a.es_label.localeCompare(b.es_label));
            } else if (lenguage === 'en') {
                data.sort((a, b) => a.en_label.localeCompare(b.en_label));
            } else {
                return res.status(200).json(data);
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching employment situations:', error);
            return res.status(500).json({ error: 'Error fetching employment situations' });
        }
    }
}