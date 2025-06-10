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
    const { quoteId } = req.body;
    
    if (!quoteId) {
      return res.status(400).json({
        error: 'quoteId es requerido'
      });
    }

    const response = await axios.post(
      `${FERN_API_BASE_URL}/transactions`,
      { quoteId },
      { headers: getAuthHeaders() }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear transacción en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear la transacción',
      details: error.response?.data || error.message
    });
  }
}
