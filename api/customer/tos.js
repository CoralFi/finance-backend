import CustomerService from '../../services/sphere/CustomerService.js';

export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const customerService = new CustomerService();
    const { customerId } = req.query;

    try {
        console.log(customerId)
      //  const tos = await validator.validate(customerId, "tos");
        const getStatus = await customerService.getKYCAndTOSStatus(customerId);
        const tos = getStatus.tosStatus;

        const isIncomplete = tos === "incomplete";

        if(isIncomplete) {
            const tosLink = await customerService.getCustomerToSLink(customerId);
            return res.status(200).json({ tosLink });
        }

        const message = tos === "approved" ? "El usuario ya aceptó los términos y condiciones" : "El usuario ya aceptó los términos y condiciones. Actualmente estamos validando sus datos";

        return res.status(200).json({ message: message });
        
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }
}