// Balance aggregation types

export interface ChainBalances {
  [currency: string]: number; // USD value for each currency
}

export interface AggregatedBalanceResponse {
  balanceTotal: number;
  [chain: string]: number | ChainBalances; // Can be balanceTotal (number) or chain data (ChainBalances)
}

// Example structure:
// {
//   balanceTotal: 100,
//   ETHEREUM: { USDC: 50, USDT: 30 },
//   POLYGON: { USDC: 20 }
// }