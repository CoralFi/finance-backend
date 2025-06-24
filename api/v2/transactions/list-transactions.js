import { FernTransactions } from "../../../services/fern/transactions.js";

export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const { fernCustomerId } = req.query;

    if (!fernCustomerId) {
        return res.status(400).json({
            error: 'fernCustomerId es requerido como parámetro de consulta'
        });
    }

    try {
        const transactions = await FernTransactions(fernCustomerId);
        res.status(200).json({ transactions });
    } catch (error) {
        console.error('Error al obtener transacciones de Fern:', error.message);
        res.status(500).json({
            error: 'Error al obtener transacciones de Fern',
            details: error.message
        });
    }
}
