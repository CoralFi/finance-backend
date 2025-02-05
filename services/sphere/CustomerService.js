import SupabaseClient from "../../database/client.js";
import WalletService from "../utila/WalletService.js";
import AddressService from "../utila/AddressService.js";

class CustomerService {
  
    constructor() { 
        this.supabase = new SupabaseClient().getClient();
        this.walletService = new WalletService();
        this.addressService = new AddressService();
    }

  async createCustomer(userInfo) {
    const { email } = userInfo;

    try {

        const response = await fetch(`${process.env.SPHERE_API_URL}/customer`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });
    
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
    
        const result = await response.json();

        const customer_id = result.data.customer.id;

        const { error: updateError } = await this.supabase
          .from('usuarios')
          .update({ customer_id: customer_id })
          .eq('email', email);

        return customer_id;

      } catch (error) {
        throw new Error("Error al crear el customer: " + error.message);
      }
  }

  async getCustomerByEmail(email) {
    try {
      const { data: user, error } = await this.supabase
        .from("usuarios")
        .select("customer_id")
        .eq("email", email)
        .single();

      const customerId = user.customer_id;

      return customerId;

      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  async getCustomerKYCLink(customerId) {
    try {
      const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}/kycLink`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('Error:', error.message);
    }

  }

  async getCustomerToSLink(customerId) {
    try {
        const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}/tosLink`, {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
              'Content-Type': 'application/json',
              },
          body: JSON.stringify({}),
          });

          if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          return result.data.url;

    } catch (error) {
        console.error('Error:', error.message);
    }

  }

  async getKYCAndTOSStatus(customerId) {
        try {
          const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}`, {
              method: 'GET',
              headers: {
                  Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
                  'Content-Type': 'application/json',
                  }
              });
          
              if (!response.ok) {
                  throw new Error(`Error ${response.status}: ${response.statusText}`);
              }

              const result = await response.json();

              const customer = result.data.customer;

              return {
                  kycStatus: customer.kyc,
                  tosStatus: customer.tos,
              };
          
          } catch (error) {
              console.error('Error:', error.message);
          }
  }

  async getVirtualAccount(customerId) { 
    try {
      const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}/virtualAccount`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  async createVirtualAccount(customerId) {
    try {

      const wallet = await this.walletService.getWalletByCustomerId(customerId);
      const addressList = await this.addressService.getAddressAndNetwork(wallet);
      const polygonAddress = addressList.find(address => address.network === "networks/polygon-mainnet").address;
      
      const body = {
        "destinationCurrency": "usdc",
        "network": "polygon",
        "walletAddresses": polygonAddress
      }

      const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}/virtualAccount`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Error al crear la cuenta virtual ${response.status}: ${response.message}`);
      }

      const result = await response.json();



      return result.depositInstructions;

    } catch (error) {
      console.error('Error:', error.message);
    }

  }

  async getBankAccounts(customerId) {
    try {
      const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data.customer.bankAccounts;

    } catch (error) {
      console.error('Error:', error.message);
    }
  }


}

export default CustomerService;