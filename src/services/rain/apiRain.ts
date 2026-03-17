import axios from 'axios';
import FormData from 'form-data';

const RAIN_BASE_URL = process.env.RAIN_API_BASE_URL;
const RAIN_API_KEY = process.env.RAIN_API_KEY;
if (!RAIN_API_KEY) {
  throw new Error('RAIN_API_KEY is not defined in environment variables');
}

const rainAxios = axios.create({
  baseURL: RAIN_BASE_URL,
  headers: {
    'api-key': RAIN_API_KEY!,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
const apiRain = {
  async createCustomer(payload: Record<string, any>) {
    const { data } = await rainAxios.post(`/v1/issuing/applications/user`, payload);
    return data;
  },
  async getLinkKyc(userId: string) {
    // https://api-dev.raincards.xyz/v1/issuing/applications/user/{userId}
    const { data } = await rainAxios.get(`/v1/issuing/applications/user/${userId}`);
    return data;
  },
  async getInfo(userId: string) {
    // https://api-dev.raincards.xyz/v1/issuing/users/{userId}
    const { data } = await rainAxios.get(`/v1/issuing/users/${userId}`);
    return data;
  },
  async createCard(payload: Record<string, any>, userId: string) {
    // https://api-dev.raincards.xyz/v1/issuing/users/{userId}/cards
    const { data } = await rainAxios.post(`/v1/issuing/users/${userId}/cards`, payload);
    return data;
  },
  async getCardById(cardId: string) {
    // https://api-dev.raincards.xyz/v1/issuing/users/{userId}/cards
    const { data } = await rainAxios.get(`/v1/issuing/cards/${cardId}`);
    return data;
  },
  async getCardsByUserId(userId: string) {
    //https://api-dev.raincards.xyz/v1/issuing/cards
    const { data } = await rainAxios.get(`/v1/issuing/cards?limit=20&userId=${userId}`);
    return data;
  },
  async getBalanceByUserId(userId: string) {
    //https://api-dev.raincards.xyz/v1/issuing/cards
    const { data } = await rainAxios.get(`/v1/issuing/users/${userId}/balances`);
    return data;
  },
  async getWithdrawalSignature(userId: string, params: Record<string, any>) {
    //https://api-dev.raincards.xyz/v1/issuing/users/{userId}/signatures/withdrawals
    const { data } = await rainAxios.get(`/v1/issuing/users/${userId}/signatures/withdrawals`, { params });
    console.log(data)
    return data;
  },
  async getCardSecrets(cardId: string, sessionId: string) {
    if (!sessionId) {
      throw new Error("SessionId is required to get card secrets");
    }
    const { data } = await axios.get(
      `${RAIN_BASE_URL}/v1/issuing/cards/${cardId}/secrets`,
      {
        headers: {
          'api-key': RAIN_API_KEY!,
          Authorization: `Bearer ${RAIN_API_KEY}`,
          SessionId: sessionId,
          Accept: "application/json",
        },
        timeout: 10_000,
      }
    );

    return data;
  },
  async getContract(userId: string) {
    //https://api-dev.raincards.xyz/v1/issuing/users/{userId}/contracts
    const { data } = await rainAxios.get(`/v1/issuing/users/${userId}/contracts`);
    return data;
  },

  async generateOnramp(data: Record<string, any>) {
    //https://api-dev.raincards.xyz/v1/automations
    const { data: response } = await rainAxios.post(`/v1/automations`, data);
    return response;
  },
};

export default apiRain;
