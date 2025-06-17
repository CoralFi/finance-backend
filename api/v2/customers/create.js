import axios from 'axios';
import { FERN_API_BASE_URL, getAuthHeaders } from '../config.js';
import supabase from '../supabase.js';
import { createFernCustomer } from "../../../services/fern/Customer.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const response = await createFernCustomer({
      user_id: req.body.user_id,
      customerType: req.body.customerType,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      businessName: req.body.businessName,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear cliente en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al crear el cliente',
      details: error.response?.data || error.message
    });
  }
}
