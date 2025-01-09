import TokenService from "./TokenService.js";

class AddressService {
    constructor() {
        this.token = new TokenService().getToken();
    }

    async getAddressesByWallet(wallet) {
        console.log("wallet: ", wallet)
        const url = `https://api.utila.io/v1alpha2/${wallet}`;

        try {
            const response = await fetch(url, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const addresses = this.findAddresses(data)
            console.log(addresses);

            return addresses;

        } catch (error) {
            console.error("Error al obtener los addresses:", error.message);
            throw error;
        }
       

    }

    async getAddressAndNetwork(wallet) {
        const url = `https://api.utila.io/v1alpha2/${wallet}/addresses`;

        try {
            const response = await fetch(url, {
                method: 'GET', 
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
           
            const addressByNetwork = data.walletAddresses.map(({ network, address }) => ({
                network,
                address
              }));;



            return addressByNetwork;

        } catch (error) {
            console.error("Error al obtener los addresses:", error.message);
            throw error;
        }
    }

    // Función recursiva para encontrar todas las direcciones
    findAddresses(obj) {
        let addresses = [];
    
        for (const key in obj) {
        const value = obj[key];
    
        // Si es un objeto, busca recursivamente
        if (value && typeof value === "object" && !Array.isArray(value)) {
            addresses = addresses.concat(this.findAddresses(value));
        }
    
        // Si es un array, recorre sus elementos
        if (Array.isArray(value)) {
            value.forEach(item => {
            if (item && typeof item === "object") {
                addresses = addresses.concat(this.findAddresses(item));
            }
            });
        }
    
        // Si es una clave address o mainAddress, almacena el valor
        if (key === "address" || key === "mainAddress") {
            addresses.push(value);
        }
        }
    
        return addresses;
    }

  
}

export default AddressService;
