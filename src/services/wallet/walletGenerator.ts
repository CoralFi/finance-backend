import crypto from "crypto";
import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";

const ALGORITHM = "aes-256-cbc";
const DEFAULT_SECRET = "12345678901234567890123456789012";

export type WalletNetwork = "evm" | "solana";

export interface GeneratedWallet {
  network: WalletNetwork;
  address: string;
  privateKey: string;
}

const getWalletSecret = (): string => process.env.WALLET_SECRET || DEFAULT_SECRET;

export function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getWalletSecret()), iv);

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function generateWallet(network: WalletNetwork = "evm"): GeneratedWallet {
  if (network === "solana") {
    const keypair = Keypair.generate();

    return {
      network,
      address: keypair.publicKey.toBase58(), 
      privateKey: Buffer.from(keypair.secretKey).toString("base64"),
    };
  }

  const wallet = ethers.Wallet.createRandom();

  return {
    network,
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}
