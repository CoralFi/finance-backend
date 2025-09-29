import { setCorsHeaders, getAuthHeaders, FERN_API_BASE_URL } from "../../config.js";


export default async function handler(req, res) {
    setCorsHeaders(res);
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    try {
        const { kybData, userId } = req.body;
        
        // Validación mejorada
        if (!kybData) {
            console.log('kybData faltante');
            return res.status(400).json({
                error: 'kybData es requerido'
            });
        }
        
        if (!userId) {
            console.log('userId faltante');
            return res.status(400).json({
                error: 'userId es requerido'
            });
        }

        console.log('📋 Datos recibidos:', JSON.stringify({ userId, kybData }, null, 2));

        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        };

        const response = await fetch(`${FERN_API_BASE_URL}/customers/${userId}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ kybData })
        });

        const responseData = await response.json();

        if (response.ok) {
            console.log({
                message: 'KYB actualizado exitosamente',
                data: responseData
            });
            return res.status(200).json({
                success: true,
                message: 'KYB actualizado exitosamente',
                data: responseData
            });
        } else {
            console.log({
                message: ' Error de Fern API:',
                data: responseData
            });
            return res.status(response.status).json({
                error: responseData.message || 'Error al actualizar KYB en Fern',
                details: responseData.details || null
            });
        }
    } catch (error) {
        console.error({
            message: 'Error updating KYB:',
            error: error
        });
        return res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
}    
