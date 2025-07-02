import { getFernBankAccountBalance } from "../../../services/fern/bankAccounts.js";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const listCurrency = ["USDT", "USDC"];
    const listChain = ["POLYGON", "BASE"];

    try {
        const { paymentAccountId } = req.query;

        if (!paymentAccountId) {
            res.status(400).json({ error: 'Payment account ID is required' });
            return;
        }

        const balancePromises = listChain.flatMap(chain =>
            listCurrency.map(currency =>
                getFernBankAccountBalance(paymentAccountId, chain, currency)
            )
        );

        const balances = await Promise.all(balancePromises);

        const result = {
            balanceTotal: 0,
        };

        balances.forEach(balanceData => {
            const chain = balanceData.currency.chain.toUpperCase();
            const currency = balanceData.currency.label;
            const usdValue = parseFloat(balanceData.usdValue);

            if (isNaN(usdValue)) {
                return;
            }

            if (!result[chain]) {
                result[chain] = {};
            }

            result[chain][currency] = usdValue;
            result.balanceTotal += usdValue;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting payment account balance:', error);
        res.status(500).json({ error: 'Error getting payment account balance', details: error });
    }
}
