import CuponesService from "../../services/cupones/CuponesService.js";

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const cuponService = new CuponesService();
    const { value } = req.query;

    try {
        const getComision = await cuponService.getComision(value);
        
        return res.status(200).json({ comision: getComision });
        
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }

}
