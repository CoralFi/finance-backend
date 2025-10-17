export const FERN_API_BASE_URL = 'https://api.fernhq.com';
const FERN_API_KEY = process.env.FERN_API_KEY; // Ensure this environment variable is configured

if (!FERN_API_KEY) {
  console.error('FERN_API_KEY is not configured in environment variables');
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
