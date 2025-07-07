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
                .from('account_purposes')
                .select('*');

            if (error) {
                return res.status(500).json({ error: error.message });
            }

            // order data alphabetically by es_label
            const processedAccountPurposes = data
                .map((acc) => ({
                    value: acc.apId,
                    label: acc.es_label || acc.en_label || '', // Fallback si es_label es undefined
                    en_label: acc.en_label
                }))
                .sort((a, b) => {
                    const labelA = a.label || '';
                    const labelB = b.label || '';
                    return labelA.localeCompare(labelB);
                });

            return res.status(200).json(processedAccountPurposes);
        } catch (error) {
            console.error('Error fetching account purposes:', error);
            return res.status(500).json({ error: 'Error fetching account purposes' });
        }
    }
}