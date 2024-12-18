import TokenService from "./TokenService.js";

class AssetsService {
    constructor() {
        this.token = new TokenService().getToken();
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
        console.log("ASSETID", asset)
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
}

export default AssetsService;
