import TokenService from "./TokenService.js";
import SupabaseClient from "../../database/client.js";
import AssetsService from "./AssetsService.js";
import AddressService from "./AddressService.js";

class BalanceService {
    constructor() {
        this.token = new TokenService().getToken();
        this.supabase = new SupabaseClient().getClient();
        this.asset = new AssetsService();
        this.addressWallet = new AddressService();
    }

    // Obtiene la lista de assets de una wallet.
    async getAssetListByWallet(id, wallet) {
        const url = `https://api.utila.io/v1alpha2/${wallet}:queryBalances`;
        const token = this.token;
        const filter = '';
        const pageSize = 4;
        const pageToken = '';
        const includeReferencedResources = true;
        const body = {
            filter,
            pageSize,
            pageToken,
            includeReferencedResources
        };

        console.log(this.token)

        try {
            // Realizar la solicitud POST con fetch
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            // Verificar si la respuesta es válida
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();

            const walletBalances = data.walletBalances;

            // Procesar cada balance y convertirlo
            const result = await Promise.all(walletBalances.map(async item => {
                const convertedValue = await this.asset.getAssetsConvertedValue(item.asset);
                const valueToUSD = item.value * convertedValue;
                const assetId = await this.asset.getAssetId(item.asset);

                return {
                    asset: assetId,
                    value: item.value,
                    valueToUSD
                };
            }));

            return result;
        } catch (error) {
            console.error("Error al obtener el balance de la wallet:", error.message);
            throw error;
        }
    }

    // Obtiene el balance total de una wallet.
    async getWalletBalance(id, wallet) {
        const assetsList = await this.getAssetListByWallet(id, wallet);
        const total= assetsList.reduce((sum, item) => sum + item.valueToUSD, 0);

        return Math.round(total * 100) / 100;
    }

    async getTransactionList(id, wallet) {
        const addressesWallet = await this.addressWallet.getAddressesByWallet(id, wallet);
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/transactions?orderBy=create_time';

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
            const transactionListByWallet = this.findTransactionsByAddresses(addressesWallet, data.transactions);

            const transactionInfo = transactionListByWallet.map(originalObject => ({
                type: originalObject.type,
                state: originalObject.state,
                createTime: originalObject.createTime,
                request: originalObject.request,
                transfers: originalObject.transfers.map(transfer => ({
                    amount: transfer.amount,
                    asset: transfer.asset,
                    sourceAddress: transfer.sourceAddress.value,
                    destinationAddress: transfer.destinationAddress.value
                })),
                transactionType: this.transationType(originalObject.request, addressesWallet)
            }));

            console.log("TRANSACTION INFO:", transactionInfo)
            return transactionInfo.reverse();

        } catch (error) {
            console.error("Error al obtener las transacciones:", error.message);
            throw error;
        }
        
    }

    transationType(sourceWallet, addressesWallet) {
        console.log("SOURCE WALLET:", sourceWallet)
        const isUndefined = sourceWallet === undefined;
        const isSameWallet = isUndefined ? false :sourceWallet.sourceWallet === addressesWallet;

        console.log("undefined:", isUndefined)
        console.log("isSameAddress:", isSameWallet)


        return isUndefined || !isSameWallet ? "deposit" : "withdraw";
    }    

    findTransactionsByAddresses(addresses, transactions) {
        return transactions.filter(transaction => {
            return transaction.transfers.some(transfer => {
                return addresses.some(address => 
                    transfer.sourceAddress.value === address ||
                    transfer.destinationAddress.value === address
                );
            });
        });
    }

    async getDashboardInfo(id, wallet) {
        const walletBalance = await this.getWalletBalance(id, wallet);
        const assetsWallet = await this.getAssetListByWallet(id, wallet);
        const transactionList = await this.getTransactionList(id, wallet);

      //  const transactionList = await this.getTransactionList();
        const dashboardInfo = {
            walletBalance,
            assetsWallet,
            transactionList
        }

        return dashboardInfo;
    }
}

export default BalanceService;
