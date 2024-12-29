import ConvertionService from "../../services/swap/ConvertionService.js"
import TransactionBO from "../../models/transaction.js";
import TransactionService from "../../services/utila/TransactionService.js";
import AssetsService from "../../services/utila/AssetsService.js";

// Tiene que devolver el balance del swap

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const convertionService = new ConvertionService()
    const transactionService = new TransactionService()
    const assetsService = new AssetsService()

    try {
        const { assetToSwap, amount, source, assetToRecive } = req.body;

        console.log("asset to swap", assetToSwap)
        console.log("ammount", assetToSwap)

        console.log("asset to recive", assetToRecive)


        const canSwap = await convertionService.validateSwap(assetToSwap, amount, assetToRecive);

        console.log("Can swap?:", canSwap)
        if(canSwap) {
            //Se hace la del cliente a la cuenta madre.
            const coralWallet = "vaults/958c80a6cbf7/wallets/e6a86b1e533b";
            const assetIdToSwap = assetsService.getAssetById(assetToSwap);
            const transactionClientDetails = new TransactionBO(assetIdToSwap, source, coralWallet, amount);
            const clientState = await transactionService.sendTransaction(transactionClientDetails);

            //Se hace la transferencia de la cuenta madre al cliente
            const totalTokenToSwap = await convertionService.getConvertionToken(assetToSwap, amount, assetToRecive);
            const assetIdToRecive = assetsService.getAssetById(assetToRecive);
            const transactionCoralDetails = new TransactionBO(assetIdToRecive, coralWallet, source, totalTokenToSwap.totalTokenToRecive.toString());
            const coralState = await transactionService.sendTransaction(transactionCoralDetails);


            console.log("Client state:", clientState)
            console.log("coral state:", coralState)
            res.status(201).json({ message: "Swap exitoso" })

        } else {
            res.status(201).json({ message: "No se puede hacer swap" })
        }


    } catch (error) {
        res.status(500).json({ message: "Error al hacer el swap, intente nuevamente."})
    }
}