export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const response = await createFernSwapQuote(req.body);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error al crear cotización en Fern:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al crear la cotización',
            details: error.response?.data || error.message
        });
    }
}
