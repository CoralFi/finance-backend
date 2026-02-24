import axios from 'axios';

const CROSSMINT_BASE_URL =
  process.env.CROSSMINT_BASE_URL ||
  'https://staging.crossmint.com/api/2025-06-09';

const CROSSMINT_API_KEY = process.env.CROSSMINT_API_KEY;

if (!CROSSMINT_API_KEY) {
  throw new Error('CROSSMINT_API_KEY is not defined in environment variables');
}

const crossmintAxios = axios.create({
  baseURL: CROSSMINT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': CROSSMINT_API_KEY,
    Accept: 'application/json',
  },
});

const crossmintApi = {
  async createWallet(chainType: string, email: string) {
    const { data } = await crossmintAxios.post('/wallets', {
      chainType,
      config: {
        adminSigner: {
          type: 'email',
          email,
        },
      },
      owner: `email:${email}`,
    });

    return data;
  },

  async getWallet(walletId: string) {
    const { data } = await crossmintAxios.get(`/wallets/${walletId}`);
    return data;
  },

  async listWallets() {
    const { data } = await crossmintAxios.get('/wallets');
    return data;
  },
};

export default crossmintApi;