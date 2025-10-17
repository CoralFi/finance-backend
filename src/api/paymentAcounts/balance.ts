import { Request, Response } from "express";
import { getFernBankAccountBalance } from "@/services/fern/paymentAccountService";
import { AggregatedBalanceResponse, ChainBalances } from "@/services/types/fernPaymentAccount.types";

export const getBalanceController = async (req: Request, res: Response): Promise<void> => {
    // Supported chains and currencies
    const listCurrency = ["USDT", "USDC"];
    const listChain = ["POLYGON", "BASE", "ETHEREUM"];

    try {
        // Get the dynamic parameter from the URL
        const { paymentAccountId } = req.params;

        // Validate required parameter
        if (!paymentAccountId) {
            res.status(400).json({
                error: 'Payment account ID is required'
            });
            return;
        }

        // Create promises for all chain/currency combinations
        const balancePromises = listChain.flatMap(chain =>
            listCurrency.map(currency =>
                getFernBankAccountBalance(paymentAccountId, chain, currency)
            )
        );

        // Fetch all balances in parallel
        const balances = await Promise.all(balancePromises);

        // Initialize result object
        const result: AggregatedBalanceResponse = {
            balanceTotal: 0,
        };

        // Process each balance response
        balances.forEach(balanceData => {
            const chain = balanceData.currency.chain.toUpperCase();
            const currency = balanceData.currency.label;
            const usdValue = parseFloat(balanceData.usdValue);

            // Skip if usdValue is not a valid number
            if (isNaN(usdValue)) {
                return;
            }

            // Initialize chain object if it doesn't exist
            if (!result[chain]) {
                result[chain] = {} as ChainBalances;
            }

            // Add currency balance to the chain
            (result[chain] as ChainBalances)[currency] = usdValue;
            
            // Add to total balance
            result.balanceTotal += usdValue;
        });

        // Return aggregated response
        res.status(200).json(result);

    } catch (error: any) {
        console.error('Error getting payment account balance:', error);
        res.status(500).json({ 
            error: 'Error getting payment account balance', 
            details: error.message 
        });
    }
};
