import TokenService from "./TokenService.js"
import SupabaseClient from "../../database/client.js";
import AssetsService from "./AssetsService.js";
import axios from "axios";

class BalanceService {
    constructor() {
        this.token = new TokenService().getToken();
        this.supabase = new SupabaseClient().getClient();
        this.asset = new AssetsService();
    }

    

    // Obtiene el balence de cada asset en una wallet.
    async getWalletBalance(userId) {
        console.log("Balance Service")
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/wallets/5ee734117a09:queryBalances';
        const token = this.token;
        const filter = '';
        const pageSize = 4;
        const pageToken = '';
        const includeReferencedResources = true;
        console.log("Token: ", token)
        const body = {
            filter,
            pageSize,
            pageToken,
            includeReferencedResources
        }

        try {
            const response = await axios.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const walletBalances = response.data.walletBalances;

            const result = await Promise.all(walletBalances.map(async item => {
                const convertedValue = await this.asset.getAssetsConvertedValue(item.asset);
                const valueToUSD = item.value * convertedValue;
                return {
                    asset: item.asset,
                    value: item.value,
                    valueToUSD
                };
            }));


            console.log("Wallet balance list: ", result)
            return result;
        } catch (error) {
            throw error;
        }

    }

    
}

export default BalanceService;