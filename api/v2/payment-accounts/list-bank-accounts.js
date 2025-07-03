import axios from 'axios';
import { getAuthHeaders, FERN_API_BASE_URL } from '../config.js';


export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    const { customerId, currency, type, chain } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Falta el customerId en la consulta' });
    }

    const { data } = await axios.get(
      `${FERN_API_BASE_URL}/payment-accounts?customerId=${customerId}`,
      { headers: getAuthHeaders() }
    );

    let accounts = data.paymentAccounts || [];

    // Filtrado por tipo
    if (type) {
      switch (type) {
        case 'fern':
          accounts = accounts.filter(acc => acc?.paymentAccountType === 'FERN_CRYPTO_WALLET');
          break;
        case 'third-party':
          accounts = accounts.filter(acc => acc?.isThirdParty === true);
          break;
        case 'external-wallet':
          if (!chain) return res.status(400).json({ error: 'Falta el chain en la consulta' });
          accounts = accounts.filter(acc => acc?.paymentAccountType === 'EXTERNAL_CRYPTO_WALLET' && acc?.externalCryptoWallet?.chain === chain);
          break;
        // Puedes agregar más tipos aquí si es necesario
        default:
          // Si el tipo no es reconocido, no filtra nada extra
          break;
      }
    }

    // Filtrado por moneda (currency)
    if (currency) {
      accounts = accounts.filter(acc => acc?.externalBankAccount?.bankAccountCurrency === currency);
    }

    return res.status(200).json(accounts);
  } catch (error) {
    console.error('Error al listar cuentas bancarias:', error?.response?.data || error.message, error.stack);
    return res.status(500).json({ error: 'Error al listar cuentas bancarias', details: error?.response?.data || error.message });
  }
}