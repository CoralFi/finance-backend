import { FERN_API_BASE_URL, getAuthHeaders } from "../../api/v2/config.js";
import supabase from "../../api/v2/supabase.js";

/**
 * Valida los datos del cliente antes de crear un registro en Fern
 * @param {Object} user - Datos del usuario
 * @throws {Error} Si faltan campos requeridos
 */
const validateCustomerData = (user) => {
    const requiredFields = ['user_id', 'email', 'firstName', 'lastName', 'customerType'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        throw new Error('Invalid email format');
    }
};

/**
 * Crea una billetera en Fern para un cliente existente
 * @param {string} customerId - ID del cliente en Fern
 * @param {string} [cryptoWalletType='EVM'] - Tipo de billetera (por defecto: 'EVM')
 * @returns {Promise<string>} ID de la billetera creada
 */
export const createFernWallet = async (customerId, cryptoWalletType = 'EVM') => {
    try {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        const walletData = {
            paymentAccountType: 'FERN_CRYPTO_WALLET',
            customerId,
            fernCryptoWallet: { cryptoWalletType }
        };

        const response = await fetch(`${FERN_API_BASE_URL}/payment-accounts`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(walletData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const walletId = data.paymentAccountId;

        console.log('Wallet created successfully:', { walletId, customerId });
        return walletId;

    } catch (error) {
        console.error('Error creating Fern wallet:', {
            error: error.message,
            customerId,
            cryptoWalletType
        });
        throw new Error(`Failed to create wallet: ${error.message}`);
    }
};

/**
 * Crea un nuevo cliente en Fern y su billetera asociada
 * @param {Object} user - Datos del usuario
 * @param {string} user.user_id - ID del usuario en la base de datos
 * @param {string} user.email - Email del usuario
 * @param {string} user.firstName - Nombre del usuario
 * @param {string} user.lastName - Apellido del usuario
 * @param {string} user.customerType - Tipo de cliente ('persona' u otro valor)
 * @returns {Promise<Object>} Datos del cliente y billetera creados
 */
export const createFernCustomer = async (user) => {
    try {
        // Validar datos de entrada
        validateCustomerData(user);

        // 1. Crear cliente en Fern
        const customerData = {
            customerType: user.customerType === "persona" ? "INDIVIDUAL" : "BUSINESS",
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            businessName: user.businessName,
        };

        console.log('Creating Fern customer:', { email: user.email });
        
        const response = await fetch(`${FERN_API_BASE_URL}/customers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(customerData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Customer created in Fern:', { data });

        const customerId = data.customerId;

        // 2. Crear billetera para el cliente
        const walletId = await createFernWallet(customerId);
        
        // 3. Guardar en base de datos local
        const fernRecord = {
            fernCustomerId: customerId,
            fernWalletId: walletId,
            KycLink: data.kycLink || null,
            Kyc: data.customerStatus !== 'ACTIVE' ? 'PENDING' : 'APPROVED',
            user_id: user.user_id,
            businessName: user.businessName,
            organizationId: data.organizationId,
        };

        console.log('Saving Fern record to database:', { userId: user.user_id });
        
        const { data: insertedData, error } = await supabase
            .from('fern')
            .insert(fernRecord)
            .select()
            .single();

        if (error) {
            console.error('Database insertion error:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        console.log('Fern record created successfully:', { 
            userId: user.user_id, 
            customerId,
            walletId,
            fernRecord,
        });

        return {
            ...fernRecord,
            // Mantener compatibilidad con el código existente
            kycLink: fernRecord.KycLink,
            kycStatus: fernRecord.Kyc,
            // También incluir los nombres originales para compatibilidad
            KycLink: fernRecord.KycLink,
            Kyc: fernRecord.Kyc
        };

    } catch (error) {
        console.error('Error in createFernCustomer:', {
            error: error.message,
            userId: user?.user_id,
            email: user?.email,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        // Asegurarse de que el mensaje de error sea seguro para el cliente
        const safeMessage = process.env.NODE_ENV === 'development' 
            ? error.message 
            : 'Error al crear el cliente en el sistema de pagos';
            
        throw new Error(safeMessage);
    }
};

/**
 * Obtiene un cliente de Fern por su ID
 * @param {string} customerId - ID del cliente en Fern
 * @returns {Promise<Object>} Datos del cliente
 */
export const getFernCustomer = async (customerId) => {
    try {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        const response = await fetch(`${FERN_API_BASE_URL}/customers/${customerId}`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Fern customer:', { customerId, error: error.message });
        throw error;
    }
};