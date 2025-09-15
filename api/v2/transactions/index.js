// api/v2/transactions/index.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-idempotency-key');

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

    // Generate a unique idempotency key
    const idempotencyKey = uuidv4();
    
    // Create headers with idempotency key
    const headers = {
      ...getAuthHeaders(),
      'x-idempotency-key': idempotencyKey
    };

    console.log('Headers sent to Fern:', headers); // For debugging

    const response = await axios.post(
      `${FERN_API_BASE_URL}/transactions`,
      { quoteId },
      { headers }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating transaction in Fern:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(error.response?.status || 500).json({
      error: 'Error creating transaction',
      details: error.response?.data || error.message
    });
  }
}