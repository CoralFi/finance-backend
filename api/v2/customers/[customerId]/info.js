import supabase from "../../supabase.js";

/**
 * Maneja las cabeceras CORS para el endpoint
 */
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://app.coralfinance.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

/**
 * Valida el customerId
 */
const validateCustomerId = (customerId) => {
    if (!customerId) {
        throw new Error('customerId es requerido como parámetro de consulta');
    }
    
    if (isNaN(parseInt(customerId))) {
        throw new Error('customerId debe ser un número válido');
    }
    
    return parseInt(customerId);
};

/**
 * Transforma los datos del cliente a la estructura esperada
 */
const transformCustomerData = (customerData) => {
    if (!customerData || customerData.length === 0) {
        return null;
    }
    
    const customer = customerData[0];
    
    return {
        user: {
            firstName: customer?.name || null,
            lastName: customer?.last_name || null,
            email: customer?.email || null,
            verificatedEmail: customer?.verificated_email,
            phoneNumber: customer?.phone_number || null,
            birthDate: customer?.birth_date || null,
        },
        employmentStatus: {
            employmentStatus: customer?.employment_situation || null,
            esLabel: customer?.employment_situation_label || null,
            enLabel: customer?.employment_situation_label_en || null,
        },
        mostRecentOccupation: {
            occupationCode: customer?.occupation_code || null,
            occupationName: customer?.occupations || null,
            esLabel: customer?.occupation_label || null,
            enLabel: customer?.occupation_label_en || null,
        },
        sourceOfFunds: {
            sourceOfFunds: customer?.source_fund || null,
            esLabel: customer?.source_fund_label || null,
            enLabel: customer?.source_fund_label_en || null,
        },
        accountPurpose: {
            accountPurpose: customer?.account_purposes || null,
            esLabel: customer?.account_purposes_label || null,
            enLabel: customer?.account_purposes_label_en || null,
        },
        expectedMonthlyPaymentsUsd: {
            expectedMonthlyPaymentsUsd: customer?.amount_to_moved || null,
            esLabel: customer?.amount_to_moved_label || null,
            enLabel: customer?.amount_to_moved_label_en || null,
        },
        isIntermediary: false,
        fern: {
            fernCustomerId: customer?.fernCustomerId || null,
            fernWalletId: customer?.fernWalletId || null,
            kyc: customer?.Kyc || null,
            kycLink: customer?.KycLink || null,
        },
        // Indicador de si la información está completa
        user_info: Boolean(
            customer?.employment_situation &&
            customer?.occupations &&
            customer?.source_fund &&
            customer?.account_purposes &&
            customer?.amount_to_moved
        )
    };
};

export default async function handler(req, res) {
    setCorsHeaders(res);

    // Manejar preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo permitir métodos GET y POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({
            error: 'Método no permitido',
            allowedMethods: ['GET', 'POST']
        });
    }

    try {
        // Validar y parsear customerId
        const customerId = validateCustomerId(req.query.customerId);
        
        if (req.method === 'GET') {
            console.log(`Obteniendo información para cliente ID: ${customerId}`);

            // Consultar información del cliente
            const { data: customerData, error: customerError } = await supabase
                .rpc('get_user_info', {
                    p_user_id: customerId
                });

            // Manejar errores de la consulta
            if (customerError) {
                console.error('Error en consulta Supabase:', customerError);
                return res.status(500).json({
                    error: 'Error al consultar la base de datos',
                    details: customerError.message
                });
            }

            // Transformar datos del cliente
            const transformedData = transformCustomerData(customerData);
            
            if (!transformedData) {
                return res.status(404).json({
                    error: 'Cliente no encontrado',
                    customerId: customerId
                });
            }

            console.log(`Cliente ${customerId} encontrado exitosamente`);
            
            // Respuesta exitosa
            return res.status(200).json({
                success: true,
                message: 'Información del cliente obtenida exitosamente',
                data: transformedData
            });
            
        } else if (req.method === 'POST') {
            console.log(`Actualizando información para cliente ID: ${customerId}`);
            
            const {
                birth_date,
                phone_number,
                employment_status,
                recent_occupation,
                account_purpose,
                funds_origin,
                expected_amount
            } = req.body;
            
            // Log de datos recibidos para debugging
            console.log('Datos recibidos:', {
                birth_date,
                phone_number,
                employment_status,
                recent_occupation,
                account_purpose,
                funds_origin,
                expected_amount
            });
            
            // Validar campos requeridos
            if (!birth_date || !phone_number || !employment_status || !recent_occupation || !account_purpose || !funds_origin || !expected_amount) {
                return res.status(400).json({
                    error: 'Todos los campos son requeridos',
                    required: ['birth_date', 'phone_number', 'employment_status', 'recent_occupation', 'account_purpose', 'funds_origin', 'expected_amount'],
                    received: {
                        birth_date: !!birth_date,
                        phone_number: !!phone_number,
                        employment_status: !!employment_status,
                        recent_occupation: !!recent_occupation,
                        account_purpose: !!account_purpose,
                        funds_origin: !!funds_origin,
                        expected_amount: !!expected_amount
                    }
                });
            }
            
            // Verificar si el usuario existe en la tabla usuarios
            const { data: userExists, error: userCheckError } = await supabase
                .from('usuarios')
                .select('user_id')
                .eq('user_id', customerId)
                .single();
            
            if (userCheckError) {
                console.error('Error al verificar usuario:', userCheckError);
                return res.status(404).json({
                    error: 'Usuario no encontrado',
                    customerId: customerId
                });
            }
            
            // Verificar si ya existe información en user_info
            const { data: existingInfo, error: infoCheckError } = await supabase
                .from('user_info')
                .select('user_id')
                .eq('user_id', customerId)
                .single();
            
            let result;
            
            if (infoCheckError && infoCheckError.code === 'PGRST116') {
                // No existe registro, crear uno nuevo
                console.log(`Creando nuevo registro de user_info para usuario ${customerId}`);
                
                const { data: insertResult, error: insertError } = await supabase
                    .from('user_info')
                    .insert({
                        user_id: customerId,
                        birthdate: birth_date,
                        phone_number: phone_number,
                        employment_situation_id: parseInt(employment_status),
                        occupation_id: parseInt(recent_occupation),
                        account_purposes_id: parseInt(account_purpose),
                        source_fund_id: parseInt(funds_origin),
                        amount_to_moved_id: parseInt(expected_amount)
                    })
                    .select();
                
                if (insertError) {
                    console.error('Error al insertar user_info:', insertError);
                    return res.status(500).json({
                        error: 'Error al crear la información del usuario',
                        details: insertError.message
                    });
                }
                
                result = { data: insertResult, error: null };
                console.log('Registro creado exitosamente:', insertResult);
                
            } else if (infoCheckError) {
                // Error inesperado
                console.error('Error al verificar user_info existente:', infoCheckError);
                return res.status(500).json({
                    error: 'Error al verificar información existente',
                    details: infoCheckError.message
                });
                
            } else {
                // Existe registro, actualizar usando RPC
                console.log(`Actualizando registro existente para usuario ${customerId}`);
                
                result = await supabase
                    .rpc('update_user_info', {
                        p_user_id: customerId,
                        p_birth_date: birth_date,
                        p_phone_number: phone_number,
                        p_employment_status_id: parseInt(employment_status),
                        p_recent_occupation_id: parseInt(recent_occupation),
                        p_account_purpose_id: parseInt(account_purpose),
                        p_funds_origin_id: parseInt(funds_origin),
                        p_expected_amount_id: parseInt(expected_amount)
                    });
                
                console.log('Resultado de actualización RPC:', result);
            }
            
            if (result.error) {
                console.error('Error en operación de base de datos:', result.error);
                return res.status(500).json({
                    error: 'Error al procesar la información del cliente',
                    details: result.error.message
                });
            }
            
            // Verificar que la operación fue exitosa consultando los datos actualizados
            const { data: verificationData, error: verifyError } = await supabase
                .rpc('get_user_info', {
                    p_user_id: customerId
                });
            
            if (verifyError) {
                console.warn('No se pudo verificar la actualización:', verifyError);
            } else {
                console.log('Verificación exitosa - datos actualizados:', verificationData?.[0]);
            }

            console.log(`Información procesada exitosamente para cliente ${customerId}`);
            
            return res.status(200).json({
                success: true,
                message: 'Información del cliente actualizada exitosamente',
                data: {
                    customerId: customerId,
                    updated: true,
                    timestamp: new Date().toISOString(),
                    verification: verificationData?.[0] || null
                }
            });
        }

    } catch (error) {
        console.error('Error en endpoint de información del cliente:', error);
        
        // Manejar errores de validación
        if (error.message.includes('customerId')) {
            return res.status(400).json({
                error: error.message
            });
        }
        
        // Error genérico del servidor
        return res.status(500).json({
            error: 'Error interno del servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
        });
    }
}
