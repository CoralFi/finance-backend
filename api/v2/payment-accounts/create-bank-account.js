import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import supabase from '../supabase.js';
import { createFernBankAccount } from '../../../services/fern/bankAccounts.js';
/**
 * API handler to create an external bank account for a customer.
 * 
 * Handles CORS, validates input, and supports EUR, USD, ARS, MXN, and BRL bank accounts.
 * For EUR accounts, requires IBAN and BIC/SWIFT; for USD accounts, requires account and routing numbers.
 * For BRL accounts, requires PIX code.
 * Calls an external API to create the account and manages transaction state with Supabase.
 * 
 * @async
 * @function
 * @param {import('next').NextApiRequest} req - The HTTP request object.
 * @param {import('next').NextApiResponse} res - The HTTP response object.
 * @returns {Promise<void>}
 * 
 * @throws {400} If required fields are missing or currency is not supported.
 * @throws {405} If HTTP method is not POST or OPTIONS.
 * @throws {500} If an error occurs during account creation.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  await supabase.rpc('begin');

  try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No se proporcionó ningún dato' });
    }

    if (data.paymentAccountType) {
      const response = await createFernBankAccount(data);
      return res.status(200).json(response);
    }

    const currency = data.externalBankAccount?.bankAccountCurrency;

    if (!data.customerId || !currency) {
      return res.status(400).json({ error: 'customerId y bankAccountCurrency son requeridos' });
    }

    const { bankName, bankAccountType, bankAddress, bankAccountOwner } = data.externalBankAccount;
    if (!bankName || !bankAccountType || !bankAddress || !bankAccountOwner) {
        return res.status(400).json({ error: 'bankName, bankAccountType, bankAddress, y bankAccountOwner son requeridos.' });
    }

    let externalBankAccount;

    if (currency === 'EUR') {
      if (!data.externalBankAccount.iban || !data.externalBankAccount.bicSwift) {
        return res.status(400).json({ error: 'iban y bicSwift son requeridos para cuentas EUR' });
      }
      externalBankAccount = {
        bankName,
        bankAccountCurrency: currency,
        bankAccountType,
        bankAddress,
        bankAccountOwner,
        iban: data.externalBankAccount.iban,
        bicSwift: data.externalBankAccount.bicSwift,
        bankAccountPaymentMethod: 'SEPA',
      };
    } else if (currency === 'USD') {
      if (!data.externalBankAccount.accountNumber || !data.externalBankAccount.routingNumber) {
        return res.status(400).json({ error: 'accountNumber y routingNumber son requeridos para cuentas USD' });
      }
      externalBankAccount = {
        bankName,
        bankAccountCurrency: currency,
        bankAccountType,
        bankAddress,
        bankAccountOwner,
        accountNumber: data.externalBankAccount.accountNumber,
        routingNumber: data.externalBankAccount.routingNumber,
        bankAccountPaymentMethod: data.externalBankAccount.bankAccountPaymentMethod,
        bicSwift: data?.externalBankAccount?.bicSwift || null,
      };
    } else if (currency === 'ARS') {
      if (!data.externalBankAccount.accountNumber || !data.externalBankAccount.taxNumber) {
        return res.status(400).json({ error: 'accountNumber (CBU) y taxNumber (CUIT/CUIL) son requeridos para ARS' });
      }
      externalBankAccount = {
        bankName,
        bankAccountCurrency: currency,
        bankAccountType,
        bankAddress,
        bankAccountOwner,
        accountNumber: data.externalBankAccount.accountNumber,
        taxNumber: data.externalBankAccount.taxNumber,
        bankAccountPaymentMethod: 'AR_TRANSFERS_3',
      };
    } else if (currency === 'MXN') {
      if (!data.externalBankAccount.clabeNumber) {
        return res.status(400).json({ error: 'clabeNumber es requerido para cuentas MXN' });
      }
      externalBankAccount = {
        bankName,
        bankAccountCurrency: currency,
        bankAccountType: bankAccountType || 'CHECKING',
        bankAddress,
        bankAccountOwner,
        clabeNumber: data.externalBankAccount.clabeNumber,
        bankAccountPaymentMethod: 'MX_SPEI',
        bicSwift: data?.externalBankAccount?.bicSwift || undefined,
      };
    } else if (currency === 'BRL') {
      if (!data.externalBankAccount.pixCode) {
        return res.status(400).json({ error: 'pixCode es requerido para cuentas BRL' });
      }
      externalBankAccount = {
        bankName,
        bankAccountCurrency: currency,
        bankAccountType: bankAccountType || 'CHECKING',
        bankAddress,
        bankAccountOwner,
        pixCode: data.externalBankAccount.pixCode,
        bankAccountPaymentMethod: data.externalBankAccount.bankAccountPaymentMethod,
        taxNumber: data.externalBankAccount.taxNumber, // CPF/CNPJ if provided
      };
    } else {
      return res.status(400).json({ error: `Moneda no soportada: ${currency}` });
    }

    const accountData = {
      paymentAccountType: 'EXTERNAL_BANK_ACCOUNT',
      customerId: data.customerId,
      nickname: data.nickname || `Cuenta bancaria externa ${currency}`,
      organizationId: data.organizationId || undefined,
      isThirdParty: true,
      externalBankAccount
    };

    // Add timeout to axios request (10 seconds)
    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      accountData,
      { headers: getAuthHeaders() }
    );

    await supabase.rpc('commit');
    console.log('Cuenta bancaria externa creada exitosamente en Fern:', response.data);
    res.status(200).json(response.data);

  } catch (error) {
    // Enhanced error logging
    console.error('Error al crear cuenta bancaria externa en Fern:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al crear la cuenta bancaria externa',
      details: error.response?.data || error.details
    });
  }
}
