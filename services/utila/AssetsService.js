import TokenService from "./TokenService.js";

class AssetsService {
    constructor() {
        this.token = new TokenService().getToken();
    }
    static cryptoEnum = {
        SOL: "assets/native.solana-mainnet",
        USDC: "assets/spl-token.solana-mainnet.EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        USDT: "assets/spl-token.solana-mainnet.Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        VCCT: 'assets/spl-token.solana-mainnet.BfnaLyLpivR9LatdeE5yq9MA8ShS62yL2EsbvVVKtfvR'
    }

    async getAssetsConvertedValue(asset) {
        const url = `https://api.utila.io/v1alpha2/${asset}`;
        const token = this.token;

        try {
            // Realizar la solicitud con fetch
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Verificar si la respuesta es válida
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();
            const convertedValue = data.asset.convertedValue;
            const result = convertedValue.amount;

            return result;
        } catch (error) {
            throw error;
        }
    }

    async getAssetId(asset) {
        const url = `https://api.utila.io/v1alpha2/${asset}`;
        const token = this.token;

        try {
            // Realizar la solicitud con fetch
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            // Verificar si la respuesta es válida
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();
            const displayName = data.asset.displayName;

            return displayName;
        } catch (error) {
            throw error;
        }
    }

    getAssetById(assetId) {
        return this.constructor.cryptoEnum[assetId] || null;
    }
}

export default AssetsService;
