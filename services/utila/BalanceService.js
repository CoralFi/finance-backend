import TokenService from "./TokenService.js";
import SupabaseClient from "../../database/client.js";
import AssetsService from "./AssetsService.js";

class BalanceService {
    constructor() {
        this.token = new TokenService().getToken();
        this.supabase = new SupabaseClient().getClient();
        this.asset = new AssetsService();
    }

    // Obtiene el balance de cada asset en una wallet.
    async getWalletBalance(userId) {
        console.log("Balance Service");
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/wallets/5ee734117a09:queryBalances';
        const token = this.token;
        const filter = '';
        const pageSize = 4;
        const pageToken = '';
        const includeReferencedResources = true;

        console.log("Token: ", token);

        const body = {
            filter,
            pageSize,
            pageToken,
            includeReferencedResources
        };

        try {
            // Realizar la solicitud POST con fetch
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            // Verificar si la respuesta es válida
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();

            const walletBalances = data.walletBalances;

            // Procesar cada balance y convertirlo
            const result = await Promise.all(walletBalances.map(async item => {
                const convertedValue = await this.asset.getAssetsConvertedValue(item.asset);
                const valueToUSD = item.value * convertedValue;
                return {
                    asset: item.asset,
                    value: item.value,
                    valueToUSD
                };
            }));

            console.log("Wallet balance list: ", result);
            return result;
        } catch (error) {
            console.error("Error al obtener el balance de la wallet:", error.message);
            throw error;
        }
    }
}

export default BalanceService;
