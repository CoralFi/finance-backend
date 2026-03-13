export type Environment = "development" | "production";

type TokenMap = {
  usdc?: string;
  usdt?: string;
  rusd?: string;
};

type ChainConfig = {
  chainId: number;
  rpc: string;
  tokens: TokenMap;
};

export const RAIN_CHAINS: Record<
  Environment,
  Record<string, ChainConfig>
> = {
  development: {
    ethereum: {
      chainId: 11155111,
      rpc: "https://ethereum-sepolia.publicnode.com",
      tokens: {},
    },

    polygon: {
      chainId: 80002,
      rpc: "https://rpc-amoy.polygon.technology",
      tokens: {
        usdc: "0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359",
        usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      },
    },

    optimism: {
      chainId: 11155420,
      rpc: "https://sepolia.optimism.io",
      tokens: {
        usdc: "0xb0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        usdt: "0x94b008aA00579c1307B0EF2c499aD98a8c5e8e58",
      },
    },

    arbitrum: {
      chainId: 421614,
      rpc: "https://sepolia-rollup.arbitrum.io/rpc",
      tokens: {
        usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        usdt: "0xfd086bc7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      },
    },

    avalanche: {
      chainId: 43113,
      rpc: "https://api.avax-test.network/ext/bc/C/rpc",
      tokens: {
        usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        usdt: "0x9702230A8Ea53601f5cD2d00fDBC13d4dF4A8c7",
      },
    },

    base: {
      chainId: 84532,
      rpc: "https://sepolia.base.org",
      tokens: {
        usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        usdt: "0x29684075a3C86ea11D9964BcAf0F956e801396bD",
        rusd: "0x10b5Be494C2962A7B318aFB63f0Ee30b959D000b",
      },
    },

    zksync: {
      chainId: 300,
      rpc: "https://sepolia.era.zksync.dev",
      tokens: {
        usdc: "0x1d17CbCf0D6D143135aE902365D2E5e2A16538D4",
        usdt: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
      },
    },

    bnb: {
      chainId: 97,
      rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
      tokens: {
        usdc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      },
    },
    solana: {
      chainId: 901,
      rpc: "https://api.devnet.solana.com",
      tokens: {
        usdc: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        rusd: "CcuoBwMZJgupcdx81m3vYqBongw2PhhZ4yiYA2jo3K5",
      }
    },

    plasma: {
      chainId: 9746,
      rpc: "https://rpc.plasma-testnet.xyz",
      tokens: {},
    },
  },

  production: {
    ethereum: {
      chainId: 1,
      rpc: "https://ethereum.publicnode.com",
      tokens: {},
    },

    polygon: {
      chainId: 137,
      rpc: "https://polygon-rpc.com",
      tokens: {
        usdc: "0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359",
        usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      },
    },

    optimism: {
      chainId: 10,
      rpc: "https://mainnet.optimism.io",
      tokens: {
        usdc: "0xb0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        usdt: "0x94b008aA00579c1307B0EF2c499aD98a8c5e8e58",
      },
    },

    arbitrum: {
      chainId: 42161,
      rpc: "https://arb1.arbitrum.io/rpc",
      tokens: {
        usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        usdt: "0xfd086bc7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      },
    },

    avalanche: {
      chainId: 43114,
      rpc: "https://api.avax.network/ext/bc/C/rpc",
      tokens: {
        usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        usdt: "0x9702230A8Ea53601f5cD2d00fDBC13d4dF4A8c7",
      },
    },

    base: {
      chainId: 8453,
      rpc: "https://mainnet.base.org",
      tokens: {
        usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
      },
    },

    zksync: {
      chainId: 324,
      rpc: "https://mainnet.era.zksync.io",
      tokens: {
        usdc: "0x1d17CbCf0D6D143135aE902365D2E5e2A16538D4",
        usdt: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
      },
    },

    bnb: {
      chainId: 56,
      rpc: "https://bsc-dataseed.binance.org",
      tokens: {
        usdc: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      },
    },
    solana: {
      chainId: 900,
      rpc: "https://api.mainnet-beta.solana.com", 
      tokens: {
        usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        usdt: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      }
    },
    plasma: {
      chainId: 9745,
      rpc: "https://rpc.plasma-mainnet.xyz",
      tokens: {},
    },
  },
};