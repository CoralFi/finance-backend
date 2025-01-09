import CustomerService from "../../../services/sphere/CustomerService.js";
//consultar kyc y actualizar la base de datos
//Devuelve los datos de la virtual account, en caso de que el usuario no tenga kyc o tos aprobado, devuelve un mensaje
//En caso de que no tenga virtual account, se crea uno y se devuelve

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
        const kycApprove = kyc === "approved";
        const kycIncomplete = kyc === "incomplete";

        if(!tosApprove || !kycApprove) {
            return res.status(400).json({ message: "El usuario no aceptó los términos y condiciones o no completó el proceso de KYC" });
        }

        const virtualAccount = await customerService.getVirtualAccount(customerId);

        if(virtualAccount && virtualAccount.length > 0) {
            const depositInstructions = virtualAccount[0].depositInstructions;
            return res.status(200).json({ depositInstructions });
        }

        const newVirtualAccount = await customerService.createVirtualAccount(customerId);
        return res.status(200).json({ newVirtualAccount });
        
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }
}
