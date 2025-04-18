import TransactionBO from "../../models/transaction.js";
import TransactionService from "../../services/utila/TransactionService.js";

export default async function handler (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }

    if(req.method === "POST") {
        const { asset, source, destination, amount } = req.body;

        console.log("Request body:", req.body);
        const transactionService = new TransactionService();
        const transactionDetails = new TransactionBO(asset, source, destination, amount);
    
        try {
            const state = await transactionService.sendTransaction(transactionDetails);
            res.status(201).json({transaction: state});
        } catch (error) {
            res.status(500).json({ message: "Error al realizar la transaccion"});
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
    
} 