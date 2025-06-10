import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitimos el método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let allCustomers = [];
    let nextPageToken = null;
    let hasMore = true;

    const config = {
      method: 'get',
      headers: getAuthHeaders()
    };

    // Manejo de paginación
    while (hasMore) {
      let url = `${FERN_API_BASE_URL}/customers?pageSize=100`;
      
      if (nextPageToken) {
        url += `&pageToken=${encodeURIComponent(nextPageToken)}`;
      }

      const response = await axios({
        ...config,
        url
      });

      const { customers, nextPageToken: newNextPageToken } = response.data;

      if (customers && customers.length > 0) {
        allCustomers = [...allCustomers, ...customers];
      }

      nextPageToken = newNextPageToken;
      hasMore = !!nextPageToken;
    }

    // Formatear la respuesta
    const formattedCustomers = allCustomers.map(customer => ({
      id: customer.customerId,
      name: customer.name,
      email: customer.email,
      status: customer.customerStatus,
      type: customer.customerType,
      updatedAt: customer.updatedAt,
      kycLink: customer.kycLink,
      organizationId: customer.organizationId
    }));

    return res.status(200).json({
      success: true,
      data: {
        total: formattedCustomers.length,
        customers: formattedCustomers
      }
    });

  } catch (error) {
    console.error('Error al listar clientes de Fern:', error.response?.data || error.message);
    
    return res.status(error.response?.status || 500).json({
      success: false,
      error: 'Error al obtener la lista de clientes',
      details: error.response?.data || error.message
    });
  }
}
