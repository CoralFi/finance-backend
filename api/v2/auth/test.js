

import supabase from "../supabase.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const testData = {
            user_id: 201,
            fernCustomerId: 'test-customer-id',
            fernWalletId: 'test-wallet-id',
            Kyc: 'PENDING'
        };

        const { data, error } = await supabase
            .from('fern')
            .insert(testData)
            .select();

        console.log('Prueba de inserción:', { data, error });
    } catch (error) {
    console.error('Error en prueba de inserción:', error);
    }
}