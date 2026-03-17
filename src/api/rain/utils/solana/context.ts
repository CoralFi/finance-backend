import { Keypair } from "@solana/web3.js";

import { RAIN_CHAINS } from "../rainChains";
import apiRain from "@/services/rain/apiRain";
import { getRainUserByRainId } from "@/services/supabase/rainUser";

type SolanaWithdrawalContextInput = {
  rainUserId?: string;
  currency: string;
};

export type SolanaWithdrawalContext = {
  rainUserId: string;
  owner: Keypair;
  contract: any;
  chainId: string;
  selectedChain: any;
  tokenAddress: string;
};

const normalizeChainId = (value: unknown): number | null => {
  const asString = String(value ?? "").trim();
  if (!asString) return null;

  const direct = Number(asString);
  if (Number.isFinite(direct)) return direct;

  const match = asString.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
};

export async function resolveSolanaWithdrawalContext(
  input: SolanaWithdrawalContextInput
): Promise<SolanaWithdrawalContext> {
  const { rainUserId, currency } = input;

  if (!rainUserId) {
    throw new Error("Usuario no autenticado");
  }

  const rainUser = await getRainUserByRainId(rainUserId);
  if (!rainUser?.solana_key) {
    throw new Error("Usuario no tiene wallet");
  }

  const owner = Keypair.fromSecretKey(
    new Uint8Array(Buffer.from(rainUser.solana_key, "base64"))
  );

  const contracts = await apiRain.getContract(rainUserId);
  const environment =
    process.env.NODE_ENV === "production" ? "production" : "development";

  const solanaChain = RAIN_CHAINS[environment].solana;
  const contract = contracts?.find(
    (item: any) => normalizeChainId(item?.chainId) === solanaChain.chainId
  );

  if (!contract) {
    throw new Error("No se encontro contrato de Solana para el usuario");
  }

  const chainId = String(contract.chainId);

  const selectedChain = Object.values(RAIN_CHAINS[environment]).find(
    (chain) => chain.chainId === Number(chainId)
  );
  if (!selectedChain) {
    throw new Error("Chain no soportada");
  }

  const tokenAddress =
    selectedChain.tokens[
      String(currency).toLowerCase() as keyof typeof selectedChain.tokens
    ];
  if (!tokenAddress) {
    throw new Error("Token no soportado");
  }

  return {
    rainUserId,
    owner,
    contract,
    chainId,
    selectedChain,
    tokenAddress,
  };
}