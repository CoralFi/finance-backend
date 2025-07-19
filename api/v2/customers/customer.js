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
            .rpc('get_user_info', {
                p_user_id: customerId
            });

        
        console.log("Customer data:", customer);
        

        if (customerError) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                details: customerError.message
            });
        }
        

        //TODO: bring more information
        res.status(200).json({
            message: 'Cliente obtenido exitosamente',
            user: {
                firstName: customer?.[0]?.name,
                lastName: customer?.[0]?.last_name,
                email: customer?.[0]?.email,
                phoneNumber: customer?.[0]?.phone_number,
            },
            employmentStatus: customer?.[0]?.employment_situation,
            mostRecentOccupation: {
                occupationCode: customer?.[0]?.occupation_code,
                occupationName: customer?.[0]?.occupations,
            },
            sourceOfFunds: customer?.[0]?.source_fund,
            accountPurpose: customer?.[0]?.account_purposes,
            expectedMonthlyPaymentsUsd: customer?.[0]?.amount_to_moved,
            isIntermediary: false,
            fern: {
                fernCustomerId: customer?.[0]?.fernCustomerId,
                fernWalletId: customer?.[0]?.fernWalletId,
                kyc: customer?.[0]?.Kyc,
                kycLink: customer?.[0]?.KycLink,
            }
        });

    } catch (error) {
        console.error('Error al obtener información del cliente:', error.message);
        res.status(500).json({
            error: 'Error al obtener información del cliente',
            details: error.response?.data || error.message
        });
    }
}
