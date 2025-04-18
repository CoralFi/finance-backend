
class TransferService {
    constructor() {

    }

    async createTransfer(customer, wallet, destination, amount, res) {
        const transfer = {
            "customer": customer,
            "source": wallet,
            "destination": destination,
            "amount": amount.toString()
        }

        console.log("TRANSFER", transfer)
        try {
            const response = await fetch(`${process.env.SPHERE_API_URL}/transfer`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transfer),
            })

            const result = await response.json();

            console.log("Result:", result)
            console.log("Result data", result.data)
            
            if (result.statusCode === 500) {
                new Error('Error al realizar la transferencia.');
            }

            console.log(response);
            return result.data.transfer;

        } catch (error) {
            return res.status(500).json({ message: "Error al realizar la transferencia crypto"});
        }
    }
}

export default TransferService;