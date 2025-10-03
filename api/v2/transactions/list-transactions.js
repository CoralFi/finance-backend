import { FernTransactions } from "../../../services/fern/transactions.js";
import { requireAuth } from "../../../middleware/requireAuth.js";
export default async function handler (req, res) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
    const origin = req.headers.origin;
    console.log(origin)
    console.log(allowedOrigins)
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    const session = await requireAuth(req);

    if (!session) {
        return res.status(401).json({ error: "Sesión inválida" });

    }
    const { fernCustomerId, status } = req.query;

    if (!fernCustomerId) {
        return res.status(400).json({
            error: 'fernCustomerId es requerido como parámetro de consulta'
        });
    }

    try {
        const transactions = await FernTransactions(fernCustomerId, status);
        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al obtener transacciones de Fern',
            details: error.message || error.toString(),
            status: error.status,
            data: error.data
        });
    }
}
