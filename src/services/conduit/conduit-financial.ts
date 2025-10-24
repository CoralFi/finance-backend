import axios from 'axios';
const CONDUIT_BASE_URL = process.env.CONDUIT_API_BASE_URL;
const CONDUIT_PUBLIC_KEY = process.env.CONDUIT_PUBLIC_KEY;
const CONDUIT_PRIVATE_KEY = process.env.CONDUIT_PRIVATE_KEY;
if (!CONDUIT_PRIVATE_KEY) {
  throw new Error('CONDUIT_PRIVATE_KEY is not defined in environment variables');
}

const conduitAxios = axios.create({
  baseURL: CONDUIT_BASE_URL,
  headers: {
    'X-API-Key': CONDUIT_PUBLIC_KEY!,
    'X-API-Secret': CONDUIT_PRIVATE_KEY!,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
const conduitFinancial = {
  async createCustomer(payload: Record<string, any>) {
    const { data } = await conduitAxios.post(`/customers`, payload);
    return data;
  },

  async getCustomer(customerId: string) {
    const { data } = await conduitAxios.get(`/customers/${customerId}`);
    return data;
  },
    async getCustomers() {
    const { data } = await conduitAxios.get(`/customers`);
    return data;
  },

  async updateCustomer(customerId: string, payload: Record<string, any>) {
    const { data } = await conduitAxios.patch(`/customers/${customerId}`, payload);
    return data;
  },

  // Puedes seguir agregando más endpoints aquí como:
  // - deleteCustomer
  // - getCustomerKybStatus
  // - updateKybDocuments
  // - etc.
};

export default conduitFinancial;
