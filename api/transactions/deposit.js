import AddressService from "../../services/utila/AddressService.js";

export default async function handler (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //todo: cambiar por la del front
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const { wallet } = req.query;
    const addressService = new AddressService();
    try {
        const getAddressAndNetwork = await addressService.getAddressAndNetwork(wallet);

        res.status(201).json({ addresses: getAddressAndNetwork });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las addresses "});
    }
}