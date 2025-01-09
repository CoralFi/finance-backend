import CustomerService from '../../services/sphere/CustomerService.js';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" });
    }

    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const customerService = new CustomerService();
    const { email } = req.body;

    try {
        const customerExists = await customerService.getCustomerByEmail(email);

        console.log(customerExists);
        if (customerExists) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const customerId = await customerService.createCustomer(req.body);

        res.status(201).json({ message: "Usuario actualizado con éxito", data: customerId });
    } catch (error) {
        res.status(500).json({ message: `${error.message}` });
    }
}