import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import supabase from '../supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  supabase.rpc('begin')
  


  try {
    const bankAccountData = req.body;
    
    if (
      !bankAccountData.customerId ||
      !bankAccountData.externalBankAccount ||
      !bankAccountData.externalBankAccount.bankName ||
      !bankAccountData.externalBankAccount.bankAccountCurrency ||
      !bankAccountData.externalBankAccount.bankAddress ||
      !bankAccountData.externalBankAccount.bankAccountType ||
      !bankAccountData.externalBankAccount.bankAccountPaymentMethod ||
      !bankAccountData.externalBankAccount.bankAccountOwner
    ) {
      return res.status(400).json({ error: 'Faltan campos requeridos para externalBankAccount' });
    }

    const accountData = {
      paymentAccountType: 'EXTERNAL_BANK_ACCOUNT',
      customerId: bankAccountData.customerId,
      nickname: bankAccountData.nickname || 'Cuenta bancaria externa',
      organizationId: bankAccountData.organizationId || undefined,
      externalBankAccount: bankAccountData.externalBankAccount,
      isThirdParty: true
    };


    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      accountData,
      { headers: getAuthHeaders() }
    );
    
    

    await supabase.rpc('commit');
    console.log('Cuenta bancaria externa creada exitosamente en Fern:', response.data);


    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear cuenta bancaria externa en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear la cuenta bancaria externa',
      details: error.response?.data || error.message
    });
  }
}
