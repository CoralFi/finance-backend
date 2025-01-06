import BalanceService from "../../services/utila/BalanceService.js";

export default async function handler (req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        //Tiene que devolver el balance de la cuenta cliente y las assets de la cuenta madre
        const balance = new BalanceService()
        const {id, wallet} = req.query;

        const clientWalletBalance = await balance.getAssetListByWallet(id, wallet);
        const coralAssetsWallet = await balance.getAssetListByWallet(0, "vaults/958c80a6cbf7/wallets/e6a86b1e533b")

        const assetsToSwap = {
            clientWalletBalance,
            coralAssetsWallet
        }

        res.status(201).json({ swap: assetsToSwap})
    } catch (error) {
        res.status(500).json({ message: "Error al intentar abrir el swap "});
    }
    
}