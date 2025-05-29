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
        //primero cobramos el 1.5 de comision y luego hacemos la transaccion.
        const comisionAmount = calcularComision(amount, "1.5");
        const amountTransfer = parseFloat(amount) - comisionAmount;

        //al valor le restamos la comision de transaccion
        const amountWithCommision = parseFloat(amountTransfer) - 1;

        //comision total es 1.5% del amount, y luego le restamos 1 de comision de transaccion.
        const commision = parseFloat(comisionAmount) + 1;

        const transactionService = new TransactionService();
        const coralAddress = "0x952B85A89e106F84F9AAa34Ba10F454e624e698C"
        const transactionDetails = new TransactionBO(asset, source, destination, amountWithCommision);
        const transactionDetailsComision = new TransactionBO(asset, source, coralAddress, commision);
    
        try {
            const state = await transactionService.sendTransaction(transactionDetails);
            console.log("transaction", state)
            if (containsStatus(state)) {
                const stateComision = await transactionService.sendTransaction(transactionDetailsComision);
                console.log("stateComison", stateComision)
            }
            res.status(201).json({transaction: state});
        } catch (error) {
            res.status(500).json({ message: "Error al realizar la transaccion"});
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
    
} 

function containsStatus(str) {
    return str.includes("AWAITING") || str.includes("SIGNED");
}

function calcularComision(amount, comision) {
   
    const numAmount = parseFloat(amount);
    const numPorcentaje = parseFloat(comision);

    if (isNaN(numAmount) || isNaN(numPorcentaje)) {
        throw new Error("Los valores deben ser números válidos.");
    }

    return (numAmount * numPorcentaje) / 100;

}