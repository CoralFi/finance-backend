import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';

/**
 * API handler to list third-party bank accounts for a given customer.
 *
 * Handles CORS preflight requests and supports only GET requests.
 * Fetches payment accounts from an external API and filters them by third-party status and optional currency.
 *
 * Query Parameters:
 * @param {import('next').NextApiRequest} req - The API request object.
 * @param {import('next').NextApiResponse} res - The API response object.
 * @query {string} customerId - The ID of the customer whose bank accounts are to be listed. (Required)
 * @query {string} [currency] - Optional currency code to filter bank accounts.
 *
 * @returns {Promise<void>} Returns a JSON array of filtered bank accounts or an error message.
 *
 * @throws {400} If customerId is missing.
 * @throws {405} If the HTTP method is not GET or OPTIONS.
 * @throws {500} If there is an error fetching or processing the bank accounts.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  try {
    const { customerId, currency } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'Falta el customerId en la consulta' });
    }

    const response = await axios.get(
      `${FERN_API_BASE_URL}/payment-accounts?customerId=${customerId}`,
      { headers: getAuthHeaders() }
    );

    if (!currency) {
      return res.status(200).json(response.data.paymentAccounts.filter(account => account.isThirdParty === true));
    }

    const result = response.data.paymentAccounts.filter(account => account.isThirdParty === true && account.externalBankAccount.bankAccountCurrency === currency);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al listar cuentas bancarias:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al listar cuentas bancarias' });
  }
}
