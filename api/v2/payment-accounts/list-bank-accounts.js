import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';

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
      return res.status(400).json({ error: 'Falta el customerId en la consulta' });
    }

    const response = await axios.get(
      `${FERN_API_BASE_URL}/payment-accounts?customerId=${customerId}`,
      { headers: getAuthHeaders() }
    );

    const result = response.data.paymentAccounts.filter(account => account.isThirdParty === true);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al listar cuentas bancarias:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al listar cuentas bancarias' });
  }
}
