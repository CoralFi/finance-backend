import TokenService from "./TokenService.js";
import axios from "axios";


class AssetsService {
    constructor() {
        this.token = new TokenService().getToken();
    }

    async getAssetsConvertedValue(asset) {
        const url = `https://api.utila.io/v1alpha2/${asset}`;
        const token = this.token;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data)
            const convertedValue = response.data.asset.convertedValue;

            const result = convertedValue.amount;

            console.log("Converted price: ", result)
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export default AssetsService;