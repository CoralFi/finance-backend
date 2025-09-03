// Configuración para la API de Fern
export const FERN_API_BASE_URL = 'https://api.fernhq.com';
const FERN_API_KEY = process.env.FERN_API_KEY; // Asegúrate de configurar esta variable de entorno

if (!FERN_API_KEY) {
  console.error('FERN_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${FERN_API_KEY}`
});

export const getAuthHeaders2 = () => ({
  'Authorization': `Bearer ${FERN_API_KEY}`
});

export const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};
