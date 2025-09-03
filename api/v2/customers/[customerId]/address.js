import supabase from "../../supabase.js";

// Validate required fields for POST
function validateAddressData(data) {
    const requiredFields = ['street_line_1', 'city', 'state_region_province', 'postal_code', 'country', 'locale', 'tittle', 'first_name', 'last_name', 'email'];
    const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
    
    if (missingFields.length > 0) {
        return { isValid: false, missingFields };
    }
    
    return { isValid: true };
}

// Transform address data for response
function transformAddressData(address) {
    return {
        id: address.bank_account_owner_address_id,
        userId: address.user_id,
        streetLine1: address.street_line_1,
        streetLine2: address.street_line_2,
        city: address.city,
        stateRegionProvince: address.state_region_province,
        postalCode: address.postal_code,
        country: address.country,
        locale: address.locale,
        title: address.tittle,
        firstName: address.first_name,
        lastName: address.last_name,
        email: address.email,
        createdAt: address.created_at
    };
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { customerId } = req.query;
    
    // Early validation
    if (!customerId || isNaN(parseInt(customerId))) {
        res.status(400).json({
            success: false,
            message: 'ID de cliente inválido',
            data: null
        });
        return;
    }

    const userId = parseInt(customerId);

    try {
        if (req.method === 'GET') {
            // Optimized query with specific fields and limit
            const { data: addresses, error } = await supabase
                .from('bank_account_owner_address')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50); // Limit results to prevent large responses

            if (error) {
                console.error('❌ Error fetching addresses:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al obtener las direcciones',
                    data: null
                });
                return;
            }

            const transformedAddresses = addresses?.map(transformAddressData) || [];
            
            res.status(200).json({
                success: true,
                message: 'Direcciones obtenidas exitosamente',
                data: { addresses: transformedAddresses }
            });
            return;

        } else if (req.method === 'POST') {
            const { street_line_1, street_line_2, city, state_region_province, postal_code, country, locale, tittle, first_name, last_name, email } = req.body;

            // Quick validation
            if (!street_line_1?.trim() || !city?.trim() || !state_region_province?.trim() || 
                !postal_code?.trim() || !country?.trim() || !locale?.trim() || !tittle?.trim() ||
                !first_name?.trim() || !last_name?.trim() || !email?.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Campos requeridos faltantes',
                    data: null
                });
                return;
            }

            // Optimized insert
            const { data: newAddress, error } = await supabase
                .from('bank_account_owner_address')
                .insert({
                    user_id: userId,
                    street_line_1: street_line_1.trim(),
                    street_line_2: street_line_2?.trim() || null,
                    city: city.trim(),
                    state_region_province: state_region_province.trim(),
                    postal_code: postal_code.trim(),
                    country: country.trim(),
                    locale: locale.trim(),
                    tittle: tittle.trim(),
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    email: email.trim()
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Error creating address:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error al crear la dirección',
                    data: null
                });
                return;
            }

            res.status(201).json({
                success: true,
                message: 'Dirección creada exitosamente',
                data: { address: transformAddressData(newAddress) }
            });
            return;

        } else {
            res.status(405).json({
                success: false,
                message: 'Método no permitido',
                data: null
            });
            return;
        }

    } catch (error) {
        console.error('❌ Unexpected error in address API:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            data: null
        });
    }
}