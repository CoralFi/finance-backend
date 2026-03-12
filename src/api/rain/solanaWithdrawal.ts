import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
 
import apiRain from "@/services/rain/apiRain";
import {
  Connection,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

import { Ed25519ExtendedProgram, IdlV2_01, MainV2_01 } from "./utils/solana/program";
import {
  Coordinator,
  WithdrawCollateral,
  submitCollateralSignature,
  resolveSolanaWithdrawalContext
} from "./utils/solana";

 
function toCents(value: string | number): string {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error("Monto invalido");
  }
  return Math.round(normalized * 100).toString();
}

export const withdrawalSolanaController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { currency, amount, recipientAddress } = req.body;

    const {
      rainUserId,
      owner,
      contract,
      chainId,
      selectedChain,
      tokenAddress
    } = await resolveSolanaWithdrawalContext({
      rainUserId: req.user?.rain_id,
      currency,
    });

    const amountInCentsParam = toCents(amount);

    const signature = await apiRain.getWithdrawalSignature(rainUserId, {
      token: tokenAddress,
      amount: amountInCentsParam,
      adminAddress: owner.publicKey.toBase58(),
      recipientAddress,
      chainId
    });

    if (!signature?.parameters?.length) throw new Error("Invalid signature response");
    if (signature.status === "pending") throw new Error("Signature is pending");

    const [
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
      executorPublisherSalt,
      executorPublisherSig
    ] = signature.parameters;

    const connection = new Connection(selectedChain.rpc, "confirmed");
    const idl: any = Object.assign(IdlV2_01, { address: contract.programAddress });
    const program = new Program<MainV2_01>(
      idl,
      new AnchorProvider(connection, new Wallet(owner), AnchorProvider.defaultOptions())
    );

    const collateral = new PublicKey(collateralProxy);
    const mint = new PublicKey(assetAddress);
    const recipientPk = new PublicKey(recipient);

    const collateralAccount = await program.account.collateralV2.fetch(collateral);
    const coordinator = await program.account.coordinator.fetch(collateralAccount.coordinator);
    const coordinatorExecutor = coordinator.executors[0];

    const collateralTokenAccount = await getAssociatedTokenAddress(
      mint,
      new PublicKey(contract.depositAddress),
      true
    );
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, owner, mint, recipientPk
    );

    const withdrawRequest: WithdrawCollateral = {
      amountOfAsset: new BN(amountInCents),
      signatureExpirationTime: new BN(expiresAt),
      coordinatorSignatureSalt: Array.from(Buffer.from(executorPublisherSalt, "base64"))
    };

    const collateralSignatureAddress = await submitCollateralSignature(
      owner,
      recipientPk,
      mint,
      withdrawRequest,
      collateralAccount.adminFundsNonce,
      program,
      collateral
    );

    const coordinatorSignature = Buffer.from(executorPublisherSig, "base64");
    const coordinatorMessage = Coordinator.getWithdrawMessage(
      collateral,
      collateralAccount.coordinator,
      owner.publicKey,
      recipientPk,
      mint,
      withdrawRequest,
      collateralAccount.adminFundsNonce
    );

    const tx = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        Ed25519ExtendedProgram.createSignatureVerificationInstruction([
          { signer: coordinatorExecutor, signature: coordinatorSignature, message: coordinatorMessage }
        ]),
        await program.methods
          .withdrawCollateralAsset(withdrawRequest)
          .accounts({
            rentReceiver: owner.publicKey,
            sender: owner.publicKey,
            receiver: recipientPk,
            asset: mint,
            collateralTokenAccount,
            receiverTokenAccount: destinationTokenAccount.address,
            coordinator: collateralAccount.coordinator,
            collateral,
            collateralAdminSignatures: collateralSignatureAddress,
            tokenProgram: TOKEN_PROGRAM_ID
          })
          .instruction()
      ),
      [owner],
      { commitment: "confirmed" }
    );

    return res.status(200).json({ success: true, tx });

  } catch (error: any) {
    console.error("WITHDRAW ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
