import BankAccountsService from "../../../services/sphere/BankAccountsService.js";
import UsdBankAccount from "../../../models/usdBankAccount.js";
import EurBankAccount from "../../../models/eurBankAccount.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const bankAccountsService = new BankAccountsService();
    
    if(req.method === "POST") {
        const { currency } = req.body;
        if (currency === 'usd') {
            const { accountNumber, routingNumber, accountType, accountName, bankName, accountHolderName, customer } = req.body;
            const usdBankAccount = new UsdBankAccount(accountNumber, routingNumber, accountType, accountName, bankName, accountHolderName, customer);
    
            try {
                const bankAccounts = await bankAccountsService.createBankAccount(usdBankAccount, res, "usd");
                res.status(200).json({ message: bankAccounts });
            } catch (error) {
                // Manejar el error específico
                res.status(500).json({ message: error.message });
            }
        } else if (currency === 'eur') {
            const { accountName, bankName, bic, iban, accountHolderName, customer } = req.body;
            const eurBankAccount = new EurBankAccount(accountName, bankName, bic, iban, accountHolderName, customer);

            console.log("eurBankAccount", eurBankAccount);
            try {
                const bankAccounts = await bankAccountsService.createBankAccountEur(eurBankAccount, res, "eur");
                res.status(200).json({ message: bankAccounts });
            } catch (error) {
                // Manejar el error específico
                res.status(500).json({ message: error.message });
            }
        } 
        
        else {
            res.status(400).json({ message: "Error al crear la cuenta bancaria" });
        }
    } else {
        return res.status(405).json({message: "Método no permitido"});
    }
    
}