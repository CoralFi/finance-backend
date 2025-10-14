import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import supabase from '../supabase.js';
import { listFernBankAccounts, handleDeleteBankAccount } from '../../../services/fern/bankAccounts.js';
import { validateCurrencyFields, buildExternalBankAccount } from '../../../utils/bankAccountUtils.js';

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const validateBasicData = (data) => {
  if (!data) throw new Error('No se proporcionó ningún dato');
  const currency = data.externalBankAccount?.bankAccountCurrency;
  if (!data.customerId || !currency)
    throw new Error('customerId y bankAccountCurrency son requeridos');
  return currency;
};


const validateCommonFields = (externalBankAccount) => {
  const { bankName, bankAccountType, bankAddress, bankAccountOwner } = externalBankAccount;
  if (!bankName || !bankAccountType || !bankAddress || !bankAccountOwner)
    throw new Error('bankName, bankAccountType, bankAddress y bankAccountOwner son requeridos.');
};

const createFernPaymentAccount = async (payload) => {
  try {
    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      payload,
      {
        headers: getAuthHeaders(),
        timeout: 10000
      }
    );
    return response;
  } catch (error) {
    console.error('Error en createFernPaymentAccount:', error.response?.data || error.message);
    throw error;
  }
};


export default async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method === 'POST') {

    const { paymentAccountType } = req.body;

    switch (paymentAccountType) {
      case 'BANK_ACCOUNT': {
        let transaction;
        try {
          transaction = await supabase.rpc('begin');
          const data = req.body;
          // if (data.paymentAccountType) {
          //   const fernResponse = await createFernBankAccount(data);
          //   await supabase.rpc('commit');
          //   return res.status(200).json({
          //     success: true,
          //     message: 'Cuenta bancaria creada exitosamente',
          //     data: fernResponse
          //   });
          // }

          const currency = validateBasicData(data);
          validateCommonFields(data.externalBankAccount);
          validateCurrencyFields(currency, data.externalBankAccount);

          const externalBankAccount = buildExternalBankAccount(currency, data);

          const accountData = {
            paymentAccountType: 'EXTERNAL_BANK_ACCOUNT',
            customerId: data.customerId,
            nickname: data.nickname || `Cuenta bancaria externa ${currency}`,
            organizationId: data.organizationId || undefined,
            isThirdParty: true,
            externalBankAccount
          };
          const apiResponse = await createFernPaymentAccount(accountData)
          // const apiResponse = await axios.post(
          //   `${FERN_API_BASE_URL}/payment-accounts`,
          //   accountData,
          //   {
          //     headers: getAuthHeaders(),
          //     timeout: 10000
          //   }
          // );

          await supabase.rpc('commit');
          console.log(`Cuenta bancaria externa ${currency} creada exitosamente:`, {
            customerId: data.customerId,
            currency,
            accountId: apiResponse.data?.id
          });

          return res.status(200).json({
            success: true,
            message: `Cuenta bancaria ${currency} creada exitosamente`,
            data: apiResponse.data
          });
        } catch (error) {
          if (transaction) {
            try {
              await supabase.rpc('rollback');
            } catch (rollbackError) {
              console.error('Error en rollback:', rollbackError.message);
            }
          }

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

          const statusCode =
            error.message?.includes('requerido') ||
              error.message?.includes('proporcionó') ||
              error.message?.includes('soportada')
              ? 400
              : 500;

          return res.status(statusCode).json({
            success: false,
            error: error.response?.data || error.message,
            details: error.response?.data || null,
            context: errorContext
          });
        }
      }
      case 'EXTERNAL_WALLET': {
        try {
          const { customerId, cryptoWalletType, nickname, chain, address } = req.body;

          if (!customerId || !cryptoWalletType || !nickname || !chain || !address) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
          }

          const walletData = {
            paymentAccountType: 'EXTERNAL_CRYPTO_WALLET',
            customerId,
            nickname,
            externalCryptoWallet: {
              cryptoWalletType,
              chain: chain || 'EVM',
              address
            },
            isThirdParty: true
          };
          const externalResponse = await createFernPaymentAccount(walletData)
          // const externalResponse = await axios.post(
          //   `${FERN_API_BASE_URL}/payment-accounts`,
          //   walletData,
          //   { headers: getAuthHeaders() }
          // );

          return res.status(200).json(externalResponse.data);
        } catch (error) {
          console.error('Error al crear billetera externa:', error.response?.data || error.message);
          return res.status(error.response?.status || 500).json({
            error: 'Error al crear la billetera externa',
            details: error.response?.data || error.message
          });
        }
      }
      case 'WALLET': {
        try {
          const { customerId, cryptoWalletType = 'EVM' } = req.body;

          const walletData = {
            paymentAccountType: 'FERN_CRYPTO_WALLET',
            customerId,
            fernCryptoWallet: { cryptoWalletType }
          };
          const fernResponse = await createFernPaymentAccount(walletData)
          // const fernResponse = await axios.post(
          //   `${FERN_API_BASE_URL}/payment-accounts`,
          //   walletData,
          //   { headers: getAuthHeaders() }
          // );

          return res.status(200).json(fernResponse.data);
        } catch (error) {
          console.error('Error al crear billetera Fern:', error.response?.data || error.message);
          return res.status(error.response?.status || 500).json({
            error: 'Error al crear la billetera Fern',
            details: error.response?.data || error.message
          });
        }
      }
      default:
        return res.status(404).json({ Message: `Método no encontrado: ${paymentAccountType}` });
    }
  } else if (req.method === 'GET') {
    try {
      const { customerId, currency, type, chain } = req.query;
      const accounts = await listFernBankAccounts(customerId, currency, type, chain);
      return res.status(200).json(accounts);
    } catch (error) {
      console.error('Error al listar cuentas bancarias:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        error: 'Error al listar las cuentas bancarias',
        details: error.response?.data || error.message
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { paymentAccountId } = req.query;

      if (!paymentAccountId) {
        return res.status(400).json({
          error: 'paymentAccountId es requerido'
        });
      }

      const response = await handleDeleteBankAccount(paymentAccountId);

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in delete-bank-account handler:', error.details || error.message);
      res.status(error.status || 500).json({
        error: 'Error al eliminar la cuenta bancaria',
        details: error.details || { message: error.message }
      });
    }
  }

  else {
    return res.status(405).json({ Message: `Método no permitido: ${req.method}` });
  }

}
