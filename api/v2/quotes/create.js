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
    const quoteData = req.body;
    
    // Validación de campos requeridos
    if (!quoteData.customerId || !quoteData.source || !quoteData.destination) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: customerId, source, destination' 
      });
    }

    // Validar campos requeridos en source
    if (!quoteData.source.sourcePaymentAccountId || 
        !quoteData.source.sourceCurrency || 
        !quoteData.source.sourcePaymentMethod || 
        !quoteData.source.sourceAmount) {
      return res.status(400).json({
        error: 'Faltan campos requeridos en source: sourcePaymentAccountId, sourceCurrency, sourcePaymentMethod, sourceAmount'
      });
    }

    // Validar campos requeridos en destination
    if (!quoteData.destination.destinationPaymentAccountId || 
        !quoteData.destination.destinationCurrency) {
      return res.status(400).json({
        error: 'Faltan campos requeridos en destination: destinationPaymentAccountId, destinationCurrency'
      });
    }

    // Construir el payload para Fern
    const quoteRequest = {
      customerId: quoteData.customerId,
      source: {
        sourcePaymentAccountId: quoteData.source.sourcePaymentAccountId,
        sourceCurrency: quoteData.source.sourceCurrency,
        sourcePaymentMethod: quoteData.source.sourcePaymentMethod,
        sourceAmount: quoteData.source.sourceAmount
      },
      destination: {
        destinationPaymentAccountId: quoteData.destination.destinationPaymentAccountId,
        destinationCurrency: quoteData.destination.destinationCurrency,
        destinationPaymentMethod: quoteData.destination.destinationPaymentMethod || 'BASE'
      }
    };

    // Agregar developerFee si está presente
    if (quoteData.developerFee) {
      quoteRequest.developerFee = {
        developerFeeType: quoteData.developerFee.developerFeeType || 'USD',
        developerFeeAmount: quoteData.developerFee.developerFeeAmount
      };
    }

    const response = await axios.post(
      `${FERN_API_BASE_URL}/quotes`,
      quoteRequest,
      { 
        headers: getAuthHeaders(),
        timeout: 10000 // 10 segundos de timeout
      }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear cotización en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear la cotización',
      details: error.response?.data || error.message
    });
  }
}
