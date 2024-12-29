import BalanceService from "../../services/utila/BalanceService.js";

class ConvertionService {

    constructor(){
        this.balance = new BalanceService();
        // Definición del "enum"
    

    }

    static cryptoEnum = {
        SOL: "solana",
        USDC: "usd-coin"
    }
    
    // Función para obtener el valor asociado a una key
    getEnumValue(key) {
        return this.constructor.cryptoEnum[key] || null; 
    }

    //dado un token lo convierte en otro
    async getConvertionToken(assetToSwap, amount, assetToRecive) {
        const cryptoToSwap = this.getEnumValue(assetToSwap);
        const cryptoToRecive = this.getEnumValue(assetToRecive);

        // Validar que los valores existan en el enum
        if (!cryptoToSwap || !cryptoToRecive) {
            throw new Error(`Invalid asset provided: ${assetToSwap} or ${assetToRecive}`);
        }

        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoToSwap},${cryptoToRecive}&vs_currencies=usd`);
        const data = await response.json();

        // Acceso dinámico a las propiedades
        console.log("data:", data);
        const assetToSwapInUsd = data[cryptoToSwap]?.usd;
        const assetToReciveUsd = data[cryptoToRecive]?.usd;

        if (!assetToSwapInUsd || !assetToReciveUsd) {
            throw new Error("Error fetching conversion rates from the API.");
        }

        const totalTokenToRecive = (amount * assetToSwapInUsd) / assetToReciveUsd;
        console.log("Token to recive: ", totalTokenToRecive);

        console.log(`1 ${cryptoToSwap} ≈ ${assetToSwapInUsd / assetToReciveUsd} ${cryptoToRecive}`);

        return {
            assetToRecive,
            totalTokenToRecive
        };
    }


    //dado un token y un amount validamos si la cuenta madre lo puede swapear
    async validateSwap(assetToSwap, amount, assetToRecive) {
        const tokenToValidate = await this.getConvertionToken(assetToSwap, amount, assetToRecive)
        console.log("TokenToValidate:", tokenToValidate);

        const coralWalletBalance = await this.balance.getAssetListByWallet(0, "vaults/958c80a6cbf7/wallets/e6a86b1e533b");

        console.log("Coral Balance:", coralWalletBalance);
        const foundAsset = coralWalletBalance.find(item => item.assetForIcon === assetToRecive);

        if (!foundAsset) {
            return false; // El asset no está presente en la lista
        }

        return parseFloat(foundAsset.value) >= tokenToValidate.totalTokenToRecive;

    }




}

export default ConvertionService;