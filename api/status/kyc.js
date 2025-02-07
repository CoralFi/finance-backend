import CustomerService from "../../services/sphere/CustomerService.js";

export default async function handler(req, res) {
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    const customerService = new CustomerService();
    const { customerId } = req.query;

    try {
        const getStatus = await customerService.getKYCAndTOSStatus(customerId);
        
        const kyc = getStatus.kycStatus;

        return res.status(200).json({ status: kyc });
        
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }

}


