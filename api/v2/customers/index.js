import axios from 'axios';
// import { requireAuth } from "../../../middleware/requireAuth.js";
import { requireApiKey } from "../../../middleware/requireApiKey.js";
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import { createFernCustomer } from "../../../services/fern/Customer.js";
export default async function handler (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const isValidApiKey = await requireApiKey(req, res);
    if (!isValidApiKey) return;

    try {
      const { user_id, customerType, email, firstName, lastName, businessName } = req.body;

      const response = await createFernCustomer({
        user_id,
        customerType,
        email,
        firstName,
        lastName,
        businessName,
      });

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error al crear cliente en Fern:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        error: 'Error al crear el cliente',
        details: error.response?.data || error.message
      });
    }
  }
  else if (req.method === 'GET') {
    // const session = await requireAuth(req);
    // if (!session) {
    //   return res.status(401).json({ error: "Sesión inválida" });
    // }
    const isValidApiKey = await requireApiKey(req, res);
    if (!isValidApiKey) return;

    try {
      let allCustomers = [];
      let nextPageToken = null;
      let hasMore = true;

      const config = {
        method: 'get',
        headers: getAuthHeaders()
      };

      while (hasMore) {
        let url = `${FERN_API_BASE_URL}/customers?pageSize=100`;
        if (nextPageToken) url += `&pageToken=${encodeURIComponent(nextPageToken)}`;

        const response = await axios({ ...config, url });
        const { customers, nextPageToken: newNextPageToken } = response.data;

        if (customers && customers.length > 0) {
          allCustomers = [...allCustomers, ...customers];
        }

        nextPageToken = newNextPageToken;
        hasMore = !!nextPageToken;
      }

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
  else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
