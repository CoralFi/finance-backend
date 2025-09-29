import { setCorsHeaders, getAuthHeaders } from "../../config.js";

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    try {
        const { kybData, userId } = req.body;
        if (!kybData) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios'
            });
        }

        const response = await fetch(`${FERN_API_BASE_URL}/customers/${userId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ kybData })
        });

        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(500).json(response);
        }
    } catch (error) {
        console.error('Error updating KYC:', error);
        return res.status(500).json({
            error: 'Error updating KYC'
        });
    }
}    
