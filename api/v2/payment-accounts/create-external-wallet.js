import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

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
        chain: chain || 'EVM', // POLYGON EHETERIUM
        address,
      },
      isThirdParty: true,
    };

    const response = await axios.post(
      `${FERN_API_BASE_URL}/payment-accounts`,
      walletData,
      { headers: getAuthHeaders() }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear billetera Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear la billetera Fern',
      details: error.response?.data || error.message
    });
  }
}
