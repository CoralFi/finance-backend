import { Request, Response } from "express";
import {
  encryptPrivateKey,
  generateWallet,
} from "@/services/wallet/walletGenerator";

export const generateWalletController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const evmWallet = generateWallet("evm");
    const solanaWallet = generateWallet("solana");

    res.status(200).json({
      success: true,
      wallets: {
        evm: {
          network: evmWallet.network,
          address: evmWallet.address,
          privateKey: evmWallet.privateKey,
          privateKeyEncrypted: encryptPrivateKey(evmWallet.privateKey),
        },
        solana: {
          network: solanaWallet.network,
          address: solanaWallet.address,
          privateKey: solanaWallet.privateKey,
          privateKeyEncrypted: encryptPrivateKey(solanaWallet.privateKey),
        },
      },
    });

  } catch (error) {
    console.error("Error generating wallet:", error);

    res.status(500).json({
      success: false,
      message: "Error generating wallet",
    });
  }
};