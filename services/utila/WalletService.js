import axios from 'axios';
import TokenService from './TokenService.js';
import SupabaseClient from "../../database/client.js";

class WalletService {
    constructor() {
        this.token = new TokenService().getToken()
        this.supabase = new SupabaseClient().getClient();
    }

    async createWallet(userId) {
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/wallets';
        const token = this.token;
        const displayName = userId.toString();
        const networks = [
            "networks/solana-mainnet"
        ];

        const body = {
            displayName,
            networks,
        };

        console.log("token:", token)

        try {
            const response = await axios.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const wallet_id = response.data.wallet.name;

            const {data, error} = await this.supabase.from('usuarios')
                .update({wallet_id: wallet_id})
                .eq('user_id', userId)

            return response.data; // Devuelve los datos al llamador
        } catch (error) {
            console.error('Error al crear la wallet:', error.response?.data || error.message);
            throw error; // Lanza el error para que la clase llamadora lo maneje
        }
    }
}

export default WalletService;