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
      return res.status(400).json({
        error: 'customerId es requerido como parámetro de consulta'
      });
    }

    const response = await axios.get(
      `${FERN_API_BASE_URL}/customers/${customerId}`,
      { headers: getAuthHeaders() }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al obtener estado del cliente en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al obtener el estado del cliente',
      details: error.response?.data || error.message
    });
  }
}
