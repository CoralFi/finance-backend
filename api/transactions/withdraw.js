import TransactionBO from "../../models/transaction.js";
import TransactionService from "../../services/utila/TransactionService.js";

export default async function handler (req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { asset, source, destination, amount } = req.body;

    const transactionService = new TransactionService();
    const transactionDetails = new TransactionBO(asset, source, destination, amount);

    try {
        const state = await transactionService.sendTransaction(transactionDetails);
        console.log("STATE", state)
        res.status(201).json({transaction: state});
    } catch (error) {
        res.status(500).json({ message: "Error al realizar la transaccion"});
    }
} 