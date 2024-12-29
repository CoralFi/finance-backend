import TokenService from "../../services/utila/TokenService.js";

class transactionService {
    constructor() {
        this.token = new TokenService().getToken();
    }

    async sendTransaction(transactionDetails) {
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/transactions:initiate';
        const token = this.token;

        console.log("Transaction details:", transactionDetails)
        const body = {
            details: {
              assetTransfer: {
                asset: transactionDetails.asset, 
                amount: transactionDetails.amount,
                source: transactionDetails.source,
                destination: transactionDetails.destination,
                payFeeFromAmount: false //shouldPayFeedAmount() //false
              }
            },
            priority: 'LOW', //definePriority(),
            designatedSigners: [
                "users/coralmacu@vault-958c80a6cbf7.utilaserviceaccount.io",
                "users/leaconti10@gmail.com",
                "users/coraldev@vault-958c80a6cbf7.utilaserviceaccount.io"
            ],
            includeReferencedResources: true
          };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),

            });

            const data = await response.json();

            console.log("Transaction data:", data)
            const state = data.transaction.state;

            return state;

        } catch (error) {{
            console.error('Error al inicializar la transacción:', error.message);
            throw error;
        }}
    }

}

export default transactionService;