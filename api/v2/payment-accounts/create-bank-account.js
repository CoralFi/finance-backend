import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import supabase from '../supabase.js';
import { createFernBankAccount } from '../../../services/fern/bankAccounts.js';
import { validateCurrencyFields, buildExternalBankAccount } from '../../../utils/bankAccountUtils.js';


// CORS headers helper
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Validation helpers
const validateBasicData = (data) => {
  if (!data) {
    throw new Error('No se proporcionó ningún dato');
  }
  
  const currency = data.externalBankAccount?.bankAccountCurrency;
  if (!data.customerId || !currency) {
    throw new Error('customerId y bankAccountCurrency son requeridos');
  }
  
  return currency;
};

const validateCommonFields = (externalBankAccount) => {
  const { bankName, bankAccountType, bankAddress, bankAccountOwner } = externalBankAccount;
  if (!bankName || !bankAccountType || !bankAddress || !bankAccountOwner) {
    throw new Error('bankName, bankAccountType, bankAddress, y bankAccountOwner son requeridos.');
  }
};


/**
 * API handler to create an external bank account for a customer.
 * 
 * Handles CORS, validates input, and supports EUR, USD, ARS, MXN, and BRL bank accounts.
 * Calls an external API to create the account and manages transaction state with Supabase.
 * 
 * @async
 * @function
 * @param {import('next').NextApiRequest} req - The HTTP request object.
 * @param {import('next').NextApiResponse} res - The HTTP response object.
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let transaction;
  
  try {
    transaction = await supabase.rpc('begin');
    const data = req.body;

    // Handle non-external bank accounts
    if (data.paymentAccountType) {
      const response = await createFernBankAccount(data);
      await supabase.rpc('commit');
      return res.status(200).json({
        success: true,
        message: 'Cuenta bancaria creada exitosamente',
        data: response
      });
    }

    // Validate input data
    const currency = validateBasicData(data);
    validateCommonFields(data.externalBankAccount);
    validateCurrencyFields(currency, data.externalBankAccount);

    // Build external bank account object
    const externalBankAccount = buildExternalBankAccount(currency, data);

    const accountData = {
      paymentAccountType: 'EXTERNAL_BANK_ACCOUNT',
      customerId: data.customerId,
      nickname: data.nickname || `Cuenta bancaria externa ${currency}`,
      organizationId: data.organizationId || undefined,
      isThirdParty: true,
      externalBankAccount
    };

    // Make API request with timeout
    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      accountData,
      { 
        headers: getAuthHeaders(),
        timeout: 10000 // 10 seconds timeout
      }
    );

    await supabase.rpc('commit');
    
    console.log(`Cuenta bancaria externa ${currency} creada exitosamente:`, {
      customerId: data.customerId,
      currency,
      accountId: response.data?.id
    });
    
    res.status(200).json({
      success: true,
      message: `Cuenta bancaria ${currency} creada exitosamente`,
      data: response.data
    });

  } catch (error) {
    // Rollback transaction on error
    if (transaction) {
      try {
        await supabase.rpc('rollback');
      } catch (rollbackError) {
        console.error('Error en rollback:', rollbackError.message);
      }
    }

    // Enhanced error logging with context
    const errorContext = {
      method: req.method,
      url: req.url,
      customerId: req.body?.customerId,
      currency: req.body?.externalBankAccount?.bankAccountCurrency,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error al crear cuenta bancaria externa:', {
      error: error.response?.data || error.message,
      context: errorContext
    });

    // Return appropriate error response
    const statusCode = error.message?.includes('requerido') || 
                      error.message?.includes('proporcionó') ||
                      error.message?.includes('soportada') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.response?.data || error.message,
      details: error.response?.data || null,
      context: errorContext
    });
  }
}
