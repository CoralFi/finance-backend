import BalanceService from '../../services/utila/BalanceService.js'

export default async function  handler (req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const balanceService = new BalanceService();

    const { userId } = req.body;

    try {
        const getBalance = await balanceService.getWalletBalance(userId);

        res.status(201).json({ balance: getBalance });
    } catch (error) {
        res.status(500).json({ message: "Error al armar el dashboard "});
    }
}