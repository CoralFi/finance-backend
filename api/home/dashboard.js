import BalanceService from '../../services/utila/BalanceService.js'

export default async function  handler (req, res) {
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


    const balanceService = new BalanceService();
    const { id, wallet } = req.query;

    try {
        const getDashboardInfo = await balanceService.getDashboardInfo(id, wallet);

        res.status(201).json({ dashboard: getDashboardInfo });
    } catch (error) {
        res.status(500).json({ message: "Error al armar el dashboard "});
    }
}