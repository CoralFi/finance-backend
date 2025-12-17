import axios from 'axios';
import FormData from 'form-data';

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
  // async getCustomers() {
  //   const { data } = await conduitAxios.get(`/customers/cus_36wHSvwX2EOhb7CUIAXMnAczpCx/account`)
  //   console.log("data", data.balances.available);
  //   // cus_36wFqvmafcbNbpgBm8SJPGL7zdY
  //   console.log("data", data.totalBalances);
  //   return data;
  // },


  async getBalanceSameName(customerId: string) {
    const { data } = await conduitAxios.get(`/customers/${customerId}/account`);
    return data.balances.available;
  },

  async updateCustomer(customerId: string, payload: Record<string, any>) {
    const { data } = await conduitAxios.patch(`/customers/${customerId}`, payload);
    return data;
  },

  async createBankAccounts(payload: Record<string, any>) {
    const { data } = await conduitAxios.post(`/counterparties `, payload);
    return data;
  },

  async getBankAccounts() {
    const { data } = await conduitAxios.get(`/counterparties`);
    return data;
  },
  async getBankAccountsById(id: string) {
    const { data } = await conduitAxios.get(`/counterparties/${id}`);
    return data;
  },
  async updateBankAccount(id: string, payload: Record<string, any>) {
    const { data } = await conduitAxios.patch(`/counterparties/${id}`, payload);
    return data;
  },
  async createQuote(payload: Record<string, any>) {
    const { data } = await conduitAxios.post(`/quotes`, payload);
    return data;
  },
  async getAccount(id: string) {
    const { data } = await conduitAxios.get(`/accounts/${id}`);
    return data;
  },
  async listAccounts() {
    const { data } = await conduitAxios.get(`/accounts`);
    return data;
  },
  async depositInstructions(id: string) {
    const { data } = await conduitAxios.get(`/accounts/${id}/deposit-instructions`);
    return data;
  },
  //
  async listTransactions() {
    const { data } = await conduitAxios.get(`/transactions`);
    return data;
  },
  async createTransacions(payload: Record<string, any>) {
    const { data } = await conduitAxios.post(`/transactions`, payload);
    return data;
  },
  async getTransaction(id: string) {
    const { data } = await conduitAxios.get(`/transactions/${id}`);
    return data;
  },

  async uploadDocument(file: Buffer, fileName: string, scope: string, type: string, purpose?: string) {
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('scope', scope);
    formData.append('type', type);
    if (purpose) {
      formData.append('purpose', purpose);
    }

    const { data } = await axios.post(`${CONDUIT_BASE_URL}/documents`, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-API-Key': CONDUIT_PUBLIC_KEY!,
        'X-API-Secret': CONDUIT_PRIVATE_KEY!,
      },
    });
    return data;
  },

  // Sandbox Simulator Methods
  async simulateCustomerKYB(customerId: string, countryCode: string) {
    const { data } = await conduitAxios.post(`/simulator/customer-kyb`, {
      id: customerId,
      countryCode: countryCode,
    });
    return data;
  },

  async changeComplianceStatus(type: 'customer' | 'counterparty', id: string, status: string) {
    const { data } = await conduitAxios.post(`/simulator/compliance`, {
      type,
      id,
      status,
    });
    return data;
  },

  // Payment Methods
  async createPaymentMethod(customerId: string, payload: Record<string, any>) {
    const { data } = await conduitAxios.post(`/customers/${customerId}/payment-methods`, payload);
    return data;
  },

  async listPaymentMethods(customerId: string) {
    const { data } = await conduitAxios.get(`/customers/${customerId}/payment-methods`);
    return data;
  },

  async getPaymentMethod(customerId: string, paymentMethodId: string) {
    const { data } = await conduitAxios.get(`/customers/${customerId}/payment-methods/${paymentMethodId}`);
    return data;
  },

  async updatePaymentMethod(customerId: string, paymentMethodId: string, payload: Record<string, any>) {
    const { data } = await conduitAxios.patch(`/customers/${customerId}/payment-methods/${paymentMethodId}`, payload);
    return data;
  },

  async deletePaymentMethod(customerId: string, paymentMethodId: string) {
    const { data } = await conduitAxios.delete(`/customers/${customerId}/payment-methods/${paymentMethodId}`);
    return data;
  },

};

export default conduitFinancial;
