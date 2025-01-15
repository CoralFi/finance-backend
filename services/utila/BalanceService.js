import TokenService from "./TokenService.js";
import SupabaseClient from "../../database/client.js";
import AssetsService from "./AssetsService.js";
import AddressService from "./AddressService.js";
import { hash } from "bcrypt";

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
                console.log("Response:",response)
                throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
            }

            // Convertir la respuesta a JSON
            const data = await response.json();

            const walletBalancesUpdate = data.walletBalances;
            
            //REmover estas lineas para cuando VCCT tenga liquidez
            const walletBalances = walletBalancesUpdate.filter(
                balance => balance.asset !== 'assets/spl-token.solana-mainnet.BfnaLyLpivR9LatdeE5yq9MA8ShS62yL2EsbvVVKtfvR'
              );

            // Procesar cada balance y convertirlo
            const result = await Promise.all(walletBalances.map(async item => {
                const convertedValue = await this.asset.getAssetsConvertedValue(item.asset);
                const valueToUSD = item.value * convertedValue;
                const assetId = await this.asset.getAssetId(item.asset);

                return {
                    assetForIcon: assetId,
                    assetForSwap: item.asset,
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
        const addressesWallet = await this.addressWallet.getAddressesByWallet(wallet);
        const url = 'https://api.utila.io/v1alpha2/vaults/958c80a6cbf7/transactions';

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

            const transactionInfo = await Promise.all(transactionListByWallet.map(async originalObject => ({
                type: originalObject.type,
                state: originalObject.state,
                createTime: originalObject.createTime,
                request: originalObject.request,
                transfers: await Promise.all(originalObject.transfers.map(async transfer => ({
                    amount: transfer.amount,
                    asset: transfer.asset,
                    assetId: await this.asset.getAssetId(transfer.asset),
                    sourceAddress: transfer.sourceAddress.value,
                    destinationAddress: transfer.destinationAddress.value,
                    hash: originalObject.hash
                }))),
                transactionType: await this.transationType(originalObject.request, addressesWallet)
            })));

            return transactionInfo;

        } catch (error) {
            console.error("Error al obtener las transacciones:", error.message);
            throw error;
        }
        
    }

    async transationType(sourceWallet, addressesWallet) {
        const isUndefined = sourceWallet === undefined;
    
        if(!isUndefined) {
            const addressBySourceWallet = await this.addressWallet.getAddressesByWallet(sourceWallet.sourceWallet);


            const addressList = [...addressBySourceWallet, sourceWallet.sourceWallet];

            const transaccion = addressList.some(address => addressesWallet.includes(address)) ? "withdraw" : "deposit";
            return transaccion;
        }

        return "deposit";
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
