import CustomerService from '../sphere/CustomerService.js';

class BankAccountsService {
    constructor() {
        this.customerService = new CustomerService();
    }

    async createUSDBankAccount(usdBankAccount, res) {
        try {
            const response = await fetch(`${process.env.SPHERE_API_URL}/bankAccount`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usdBankAccount),
            });
    
            // Verificar si la respuesta no es exitosa
        
            // Parsear la respuesta JSON
            const result = await response.json();
    
            // Verificar si el statusCode es 500
            if (result.statusCode === 500) {
                throw new Error('La cuenta bancaria ya existe. Cree una nueva o seleccione otra de su lista de contactos.');
            }
    
            // Retornar la cuenta bancaria creada
            return result.data.bankAccount;
        } catch (error) {
            // Retornar el error con el mensaje específico
            throw error;
        }
    }

    async getBankAccounts(customerId) {
        try {
        const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}`, {
            method: 'GET',
            headers: {
            Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
            'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data.customer.bankAccounts;

        } catch (error) {
        console.error('Error:', error.message);
        }
    }

    async getBankAccountInfo(customerId) {
        try {
            // Obtener todas las cuentas bancarias del cliente
            const bankAccounts = await this.getBankAccounts(customerId);
    
            // Crear un array de promesas para las solicitudes fetch
            const fetchPromises = bankAccounts.map(async (bankAccount) => {
                try {
                    // Hacer la solicitud para obtener la información de la cuenta bancaria
                    const response = await fetch(`${process.env.SPHERE_API_URL}/bankAccount/${bankAccount}`, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
                            'Content-Type': 'application/json',
                        },
                    });
    
                    // Verificar si la respuesta es exitosa
                    if (!response.ok) {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
    
                    // Parsear la respuesta JSON
                    const result = await response.json();
                    const bankAccountsInfo = result.data.bankAccount;
                    console.log('result:', bankAccountsInfo);
                    // Verificar si el status es 'active'
                    if (bankAccountsInfo.status === 'active') {
                        // Seleccionar solo los campos necesarios
                        return {
                            accountType: bankAccountsInfo.accountType,
                            currency: bankAccountsInfo.currency,
                            routingNumber: bankAccountsInfo.routingNumber,
                            id: bankAccountsInfo.id,
                            last4: bankAccountsInfo.last4,
                            bankName: bankAccountsInfo.bankName,
                            accountHolderName: bankAccountsInfo.accountHolderName,
                            accountName: bankAccountsInfo.accountName,
                        };
                    }

                    // Si el status no es 'active', retornar null
                    return null;
                } catch (error) {
                    console.error(`Error fetching account ${bankAccount.id}:`, error.message);
                    return null; // Retornar null en caso de error
                }
            });
    
            // Esperar a que todas las solicitudes se completen
            const bankAccountsInfo = await Promise.allSettled(fetchPromises);

           // Filtrar y mapear solo las cuentas activas (eliminar los null y los errores)
        const activeAccounts = bankAccountsInfo
        .filter((result) => result.status === 'fulfilled' && result.value !== null) // Filtramos solo los "fulfilled" y no nulos
        .map((result) => result.value); // Extraemos solo el valor


        console.log('activeAccounts:', activeAccounts);
        return activeAccounts;
        } catch (error) {
            console.error('Error:', error.message);
            throw error; // Relanzar el error para que el llamador pueda manejarlo
        }
    }
}

export default BankAccountsService;