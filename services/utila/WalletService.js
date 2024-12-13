import TokenService from './TokenService.js';
import SupabaseClient from "../../database/client.js";

class WalletService {
    constructor() {
        this.token = new TokenService().getToken();
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

        console.log("token:", token);

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
                const errorData = await response.json();
                console.error('Error en la solicitud:', errorData);
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();
            const wallet_id = data.wallet.name;

            // Actualizar la base de datos usando Supabase
            const { data: dbData, error } = await this.supabase.from('usuarios')
                .update({ wallet_id })
                .eq('user_id', userId);

            if (error) {
                console.error('Error al actualizar la base de datos:', error);
                throw error;
            }

            return data; // Devuelve los datos de la respuesta
        } catch (error) {
            console.error('Error al crear la wallet:', error.message);
            throw error; // Lanza el error para que la clase llamadora lo maneje
        }
    }
}

export default WalletService;
