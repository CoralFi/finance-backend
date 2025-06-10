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
    const { transactionId } = req.query;
    
    if (!transactionId) {
      return res.status(400).json({
        error: 'transactionId es requerido como parámetro de consulta'
      });
    }

    const response = await axios.get(
      `${FERN_API_BASE_URL}/transactions/${transactionId}`,
      { headers: getAuthHeaders() }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al obtener estado de la transacción en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener el estado de la transacción',
      details: error.response?.data || error.message
    });
  }
}
