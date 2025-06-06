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

        const { customer, amount, destination, comision, asset } = req.body;
        const wallet = await customerService.getWallet(customer);

        const source = {
            "id": wallet,
            "network": "polygon",
            "currency": getCurrency(asset)
        }

        console.log("wallet", wallet)
        const validateComision = esValido(comision) ? comision : "1.5";
        const comisionAmount = calcularComision(amount, validateComision);
        const amountTransfer = parseFloat(amount) - comisionAmount;

        //Todo: validar si el amount se manda entero o se le resta la comision
        const transfer = await transferService.createTransfer(customer, source, destination, amountTransfer, res);

        if(transfer.statusCode !== 500 && transfer.instructions !== null) {
            const sphereAddress = transfer.instructions.resource.address;
            const customerWallet = await userService.getWalletByCustomer(customer);
            const coralAddress = "0x952B85A89e106F84F9AAa34Ba10F454e624e698C"
            const transactionDetailsOffRamp = new TransactionBO(asset, customerWallet, sphereAddress, amountTransfer);

            const transactionDetailsComision = new TransactionBO(asset, customerWallet, coralAddress, comisionAmount);

            try {
                const state = await transactionService.sendTransaction(transactionDetailsOffRamp);

                console.log("transaction", state)
                if (containsStatus(state)) {
                    const stateComision = await transactionService.sendTransaction(transactionDetailsComision);
                    console.log("stateComison", stateComision)
                }

                res.status(201).json({transaction: state});


            } catch(error) {
                res.status(500).json({ message: "Error al retirar crypto"});

            }
        } else {
        //    return res.status(500).json({message: "Error al retirar crypto."});
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

function esValido(str) {
    return typeof str === "string" && str.trim() !== "";
}

function getCurrency(asset) {
    if (asset === "assets/erc20.polygon-mainnet.0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359") {
        return "usdc";
    } else if (asset === "assets/erc20.polygon-mainnet.0xc2132D05D31c914a87C6611C10748AEb04B58e8F") {
        return "usdt";
    } else {
        return null;
    }
}