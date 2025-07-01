import { handleDeleteBankAccount } from "../../../services/fern/bankAccounts.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') return res.status(405).send('Method Not Allowed');

    try {
        // El ID de la cuenta de pago se espera como 'paymentAccountId' según la documentación de Fern
        const { paymentAccountId } = req.query;

        if (!paymentAccountId) {
            return res.status(400).json({
                error: 'paymentAccountId es requerido'
            });
        }

        const response = await handleDeleteBankAccount(paymentAccountId);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error in delete-bank-account handler:', error.details || error.message);
        res.status(error.status || 500).json({
            error: 'Error al eliminar la cuenta bancaria',
            details: error.details || { message: error.message }
        });
    }
}