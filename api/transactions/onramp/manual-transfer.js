//Debemos recibir la banckAccount, el amount y el type de la transancion
//si el status es ok vamos a recibir la wallet  adonde hacer la tranferencia
//desde la wallet del usuario hacer la transferencia a la wallet recibida, si la transaccion sale ok
//cobrar la comisión del 1,5% para coral
import TransferService from "../../../services/sphere/TransferService.js";
import AddressService from "../../../services/utila/AddressService.js";
import CustomerService from "../../../services/sphere/CustomerService.js";
import TransactionBO from "../../../models/transaction.js";
import TransactionService from "../../../services/utila/TransactionService.js";
import UserService from "../../../services/UserService.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const transferService = new TransferService();
    const addressService = new AddressService();
    const customerService = new CustomerService();
    const transactionService = new TransactionService();
    const userService = new UserService();

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if(req.method === "POST") {
        //ver si la comision va a ser el porcentaje o el valor.
        const { customer, amount, source } = req.body;
        const wallet = await customerService.getWallet(customer);

        const destination = {
            "id": wallet,
            "network": "polygon",
            "currency": "usdc"
        }

        console.log("wallet", wallet)

        const transfer = await transferService.createTransfer(customer, source, destination, amount, res);

        console.log("transfer", transfer);

        const depositInstructions = {
            "message": "Envía el monto indicado a la siguiente cuenta bancaria:  ",
            "currency": "eur",
            "bankName": transfer.instructions.resource.bankName,
            "bankAddress": transfer.instructions.resource.bankAddressString,
            "bic": transfer.instructions.resource.bic,
            "iban": transfer.instructions.resource.iban,
            "bankBeneficiaryName": transfer.instructions.resource.accountHolderName,
            "memo": transfer.instructions.memo,
        }

        return res.status(200).json({ depositInstructions });


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

function esValido(str) {
    return typeof str === "string" && str.trim() !== "";
}