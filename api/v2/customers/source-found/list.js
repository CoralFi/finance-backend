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
                .from('source_fund')
                .select('*')

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            // order data alphabetically by es_label
            const processedSourcesFund = data
                .map((src) => ({
                    value: src.sfId,
                    sf_name: src.sf_name,
                    label: src.es_label || src.en_label || '', // Fallback si es_label es undefined
                    en_label: src.en_label,
                    is_bussines: src.is_bussines,
                }))
                .sort((a, b) => {
                    const labelA = a.label || '';
                    const labelB = b.label || '';
                    return labelA.localeCompare(labelB);
                });

            return res.status(200).json(processedSourcesFund);
        } catch (error) {
            console.error('Error fetching found sources:', error);
            return res.status(500).json({ error: 'Error fetching found sources' });
        }
    }
}
    