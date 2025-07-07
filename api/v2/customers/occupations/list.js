import axios from 'axios';
import supabase from '../../supabase.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('occupations')
                .select('*');

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json(data);
        } catch (error) {
            console.error('Error fetching occupations:', error);
            return res.status(500).json({ error: 'Error fetching occupations' });
        }
    }
}