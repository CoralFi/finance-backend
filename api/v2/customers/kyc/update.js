import { FernKycUpdate } from "../../../../services/fern/kycStatus.js";
import supabase from "../../supabase.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { kycData, userId } = req.body;

    //get fernCustomerId from fern
    const { data: fernData, error: fernError } = await supabase
    .from('fern')
    .select(`fernCustomerId`)
    .eq('user_id', userId)
    .single();

if (!fernData) {
    console.error("Error getting fern data:", fernError);
    return res.status(500).json(
        { message: "Error getting fern data" }
    );
}

    if (!kycData) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios'
      });
    }

    const response = await FernKycUpdate(fernData.fernCustomerId, kycData, userId);

    res.status(200).json(response);
    return;
  } catch (error) {
    console.error('Error al actualizar cliente en Fern:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error al actualizar el cliente',
      details: error.response?.data || error.message
    });
    return;
  }
}