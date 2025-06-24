import { getFernWalletCryptoInfo } from "../../../services/fern/wallets.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    try {
        const { paymentAccountId } = req.query;

        if (!paymentAccountId) {
            return res.status(400).json({ error: 'Falta el paymentAccountId en la consulta' });
        }

        const response = await getFernWalletCryptoInfo(paymentAccountId);
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al obtener información de la cuenta de pago:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error al obtener información de la cuenta de pago' });
    }
}
