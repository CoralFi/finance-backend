
import supabase from '@/db/supabase';

interface BalanceResponse {
  balanceTotal: number;
  [network: string]: number | Record<string, number>;
}

interface Transaction {
  source_asset?: string;
  source_network?: string;
  source_amount?: string | number;
  destination_asset?: string;
  destination_network?: string;
  destination_amount?: string | number;
  transaction_type: string;
  status: string;
}

/**
 * Filtra y calcula los balances desde las transacciones de Conduit
 * @param data - Array de transacciones de la tabla conduit_transactions
 * @returns Balance total y balances por red y activo
 */
export const filterBalance = async (conduitId: string): Promise<BalanceResponse> => {
  const { data, error } = await supabase
    .from('conduit_transactions')
    .select('source_asset, source_network, source_amount, destination_asset, destination_network, destination_amount, transaction_type, status,wallet_address')
    .or(`conduit_id.eq.${conduitId},transaction_type.eq.deposit`);
  if (error) {
    return { balanceTotal: 0 };
  }


  if (!data || data.length === 0) {
    return { balanceTotal: 0 };
  }
  const { data: paymentMethods, error: pmError } = await supabase
    .from('conduit_payment_methods')
    .select('wallet_address, customer_id, wallet_label, rail');

  if (pmError) {
    return { balanceTotal: 0 };
  }

  // Inicializar objeto de balances por red y activo
  const balances: Record<string, Record<string, number>> = {};
  let balanceTotal = 0;

  // Procesar cada transacción
  data.forEach((tx: Transaction) => {
    // Solo procesar transacciones completadas
    if (!tx.status || tx.status.toLowerCase() !== 'completed') {
      return;
    }

    // Determinar la red y el activo según el tipo de transacción
    let network: string;
    let asset: string;
    let amount: number;
    let sign: number;
    if (tx.transaction_type === 'onramp') {
      // Onramp: suma al balance (entrada de fondos)
      network = tx.destination_network ? tx.destination_network.toUpperCase() : 'UNKNOWN';
      asset = tx.destination_asset ? tx.destination_asset.toUpperCase() : 'UNKNOWN';
      amount = Number(tx.destination_amount) || 0;
      sign = 1;
    } else if (tx.transaction_type === 'offramp') {
      // Offramp: resta del balance (salida de fondos)
      network = tx.source_network ? tx.source_network.toUpperCase() : 'UNKNOWN';
      asset = tx.source_asset ? tx.source_asset.toUpperCase() : 'UNKNOWN';
      amount = Number(tx.source_amount) || 0;
      sign = -1;
    }
    else if (tx.transaction_type === 'deposit') {
      const walletAddress = (tx as any).wallet_address;
      if (!walletAddress) return;
      const match = paymentMethods.find(
        (pm: any) =>
          pm.wallet_address === walletAddress && pm.customer_id === conduitId
      );
      console.log(match)
      if (!match) return;
      network = match.rail?.toUpperCase() || 'UNKNOWN';
      asset = match.wallet_label?.toUpperCase() || 'UNKNOWN';
      amount = Number((tx as any).destination_amount) / 1_000_000;
      console.log(amount)
      sign = 1

    }
    else {
      // Otros tipos de transacciones (deposit, withdrawal, conversion, transfer)
      network = tx.source_network ? tx.source_network.toUpperCase() : tx.destination_network?.toUpperCase() || 'UNKNOWN';
      asset = tx.source_asset ? tx.source_asset.toUpperCase() : tx.destination_asset?.toUpperCase() || 'UNKNOWN';
      amount = Number(tx.source_amount) || Number(tx.destination_amount) || 0;
      sign = 0; // No afecta el balance total para otros tipos
    }
    // Inicializar red si no existe
    if (!balances[network]) {
      balances[network] = {};
    }

    // Inicializar activo si no existe
    if (!balances[network][asset]) {
      balances[network][asset] = 0;
    }

    // Actualizar balance del activo en la red
    balances[network][asset] += amount * sign;

    // Actualizar balance total
    balanceTotal += amount * sign;
  });

  // Redondear todos los valores a 2 decimales
  Object.keys(balances).forEach(network => {
    Object.keys(balances[network]).forEach(asset => {
      balances[network][asset] = Number(balances[network][asset].toFixed(2));
    });
  });

  // Construir respuesta
  const response: BalanceResponse = {
    balanceTotal: Number(balanceTotal.toFixed(2)),
    ...balances,
  };

  return response;
};