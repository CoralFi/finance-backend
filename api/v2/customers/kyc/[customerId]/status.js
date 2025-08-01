import { FernKycStatus } from "../../../../../services/fern/kycStatus.js";
import supabase from "../../../supabase.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    try {
        const customerId = req.query.customerId;
        
        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: 'customerId es requerido como parámetro de consulta'
            });
        }

        const { data: existing, error: fetchError } = await supabase
            .from('fern')
            .select('*')
            .eq('user_id', customerId)
            .single();

        if (fetchError) {
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el estado del cliente',
                details: fetchError
            });
        }

        const response = await FernKycStatus(existing.fernCustomerId, existing.user_id);
        
        res.status(200).json({
            success: true,
            message: 'Estado del cliente obtenido exitosamente',
            data: response
        });
    } catch (error) {
        console.error('Error al obtener estado del cliente en Fern:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el estado del cliente',
            details: error
        });
    }
}
