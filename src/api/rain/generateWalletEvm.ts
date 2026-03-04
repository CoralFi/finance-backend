import { Request, Response } from "express";
import { ethers } from "ethers";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const secret = process.env.WALLET_SECRET || "12345678901234567890123456789012";

function encryptPrivateKey(privateKey: string) {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secret),
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted: iv.toString("hex") + ":" + encrypted,
    iv: iv.toString("hex"),
  };
}

export const generateWalletController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {

    const wallet = ethers.Wallet.createRandom();

    const address = wallet.address;
    const privateKey = wallet.privateKey;

    const { encrypted } = encryptPrivateKey(privateKey);

    res.status(200).json({
      success: true,
      wallet: {
        address,
        privateKey,
        privateKeyEncrypted: encrypted,
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