import CustomerService from '../../services/sphere/CustomerService.js';

//Solo puede hacer el kyc si tiene el tos aprobado, con el kyc aprobado puede crear la virtual account
// actualizar la bbdd con el estado del tos aca
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
        const tos = getStatus.tosStatus;
        const kyc = getStatus.kycStatus;

        const tosApprove = tos === "approved";
        const kycIncomplete = kyc === "incomplete" || kcy === "pending";

        if(tosApprove && kycIncomplete) {
            const kycLink = await customerService.getCustomerKYCLink(customerId);
            return res.status(200).json({ kycLink });
        }

        if(!tosApprove) {
            return res.status(400).json({ message: "El usuario no aceptó los términos y condiciones o están pendientes de revisión" });
        }

        const message = kyc === "approved" ? "El usuario ya completó el proceso de KYC" : "Actualmente estamos validando sus datos";

        return res.status(200).json({ message: message });
        
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }
}