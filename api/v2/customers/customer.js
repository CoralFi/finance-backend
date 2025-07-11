import supabase from "../supabase.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    try {
        const { customerId } = req.query;
        
        if (!customerId) {
            return res.status(400).json({
                error: 'customerId es requerido como parámetro de consulta'
            });
        }

        const { data: customer, error: customerError } = await supabase
            .from('user_info')
            .select(`
                phone_number,
                occupations (en_label),
                employment_situation,
                source_fund (en_label),
                account_purposes (en_label),
                amount_to_moved
            `)
            .eq('user_id', customerId)
            .single();


        
        if (customerError) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                details: customerError.message
            });
        }
        

        //TODO: bring fern data among others
        res.status(200).json({
            phoneNumber: customer?.phone_number,
            employmentStatus: customer?.employment_situation,
            mostRecentOccupation: customer?.occupations?.en_label,
            sourceOfFunds: customer?.source_fund?.en_label,
            accountPurpose: customer?.account_purposes?.en_label,
            expectedMonthlyPaymentsUsd: customer?.amount_to_moved,
            isIntermediary: false
        });


    } catch (error) {
        console.error('Error al obtener información del cliente:', error.message);
        res.status(500).json({
            error: 'Error al obtener información del cliente',
            details: error.response?.data || error.message
        });
    }
}
