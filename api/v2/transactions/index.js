// api/v2/transactions/index.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import { FernTransactions } from "../../../services/fern/transactions.js";
export default async function handler (req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-idempotency-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method == 'POST') {

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

      console.log('Headers sent to Fern:', headers);  

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
  else if (req.method === 'GET') {
    try {
      const { fernCustomerId, status, transactionId } = req.query;
      if (transactionId && fernCustomerId) {
        return res.status(400).json({
          error: 'No puedes enviar transactionId y fernCustomerId al mismo tiempo. Usa solo uno.'
        });
      }
      if (transactionId) {
        if (!transactionId.trim()) {
          return res.status(400).json({ error: 'transactionId no puede estar vacío' });
        }

        const response = await axios.get(
          `${FERN_API_BASE_URL}/transactions/${transactionId}`,
          { headers: getAuthHeaders() }
        );

        return res.status(200).json(response.data);
      }

      if (fernCustomerId) {
        if (!fernCustomerId.trim()  ) {
          return res.status(400).json({
            error: 'fernCustomerI es requerido para listar transacciones'
          });
        }
        const transactions = await FernTransactions(fernCustomerId, status);
        return res.status(200).json({ transactions });
      }
      return res.status(400).json({
        error: 'Debes proporcionar transactionId o fernCustomerId + status como parámetros de consulta.'
      });

    } catch (error) {
      console.error('Error al obtener transacciones:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        error: 'Error al obtener transacciones',
        details: error.response?.data || error.message
      });
    }
  }

}