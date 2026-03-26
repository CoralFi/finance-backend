import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import apiRain from "@/services/rain/apiRain";
import {
  Connection, PublicKey, Transaction, sendAndConfirmTransaction
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

import { Ed25519ExtendedProgram } from "./utils/solana/program";
import { Coordinator, WithdrawCollateral } from "./utils/solana/eip712";
import { submitCollateralSignature } from "./utils/solana/submitSignature";
import { resolveSolanaWithdrawalContext } from "./utils/solana/context";
import { resolveCollateralVersion } from "./utils/solana/resolveCollateral";

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
    console.log("[1] Request recibido:", { currency, amount, recipientAddress });

   
    const {
      rainUserId, owner, contract, chainId, selectedChain, tokenAddress
    } = await resolveSolanaWithdrawalContext({
      rainUserId: req.user?.rain_id,
      currency,
    });
    console.log("[2] Contexto resuelto:", {
      rainUserId,
      ownerPublicKey: owner.publicKey.toBase58(),
      chainId,
      tokenAddress,
      programAddress: contract.programAddress,
      proxyAddress: contract.proxyAddress,
      depositAddress: contract.depositAddress,
    });

    const amountInCentsParam = toCents(amount);
    console.log("[3] Amount en cents:", amountInCentsParam);

    const connection = new Connection(selectedChain.rpc, "confirmed");
    const collateral = new PublicKey(contract.proxyAddress);
    const mint = new PublicKey(tokenAddress);
    const recipientPk = new PublicKey(recipientAddress);
 
    console.log("[4] Detectando versión del collateral...");
    const { version, program, coordinator: coordinatorPk, nonce } =
      await resolveCollateralVersion(connection, owner, contract.programAddress, collateral);
    console.log("[5] Versión detectada:", version, "| coordinator:", coordinatorPk.toBase58(), "| nonce:", nonce);
 
    console.log("[6] Pidiendo withdrawal signature a Rain...");
    const signature = await apiRain.getWithdrawalSignature(rainUserId, {
      token: tokenAddress,
      amount: amountInCentsParam,
      adminAddress: owner.publicKey.toBase58(),
      recipientAddress,
      chainId,
    });
    console.log("[7] Signature Rain recibida:", {
      status: signature.status,
      parametersCount: signature.parameters?.length,
    });

    if (signature.status === "pending") throw new Error("Signature is pending");
    if (!signature?.parameters?.length) throw new Error("Invalid signature response");

    const [
      collateralProxy, assetAddress, amountInCents, recipient,
      expiresAt, executorPublisherSalt, executorPublisherSig
    ] = signature.parameters;
    console.log("[8] Parámetros Rain:", {
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
    });

    const withdrawRequest: WithdrawCollateral = {
      amountOfAsset: new BN(amountInCents),
      signatureExpirationTime: new BN(expiresAt),
      coordinatorSignatureSalt: Array.from(Buffer.from(executorPublisherSalt, "base64")),
    };
    console.log("[9] WithdrawRequest construido:", {
      amountOfAsset: withdrawRequest.amountOfAsset.toString(),
      signatureExpirationTime: withdrawRequest.signatureExpirationTime.toString(),
      saltLength: withdrawRequest.coordinatorSignatureSalt.length,
    });

    // --- Coordinator ---
    console.log("[10] Fetching coordinator account:", coordinatorPk.toBase58());
    const coordinatorAccount = await (program.account as any).coordinator.fetch(coordinatorPk);
    const coordinatorExecutor = coordinatorAccount.executors[0];
    console.log("[11] Coordinator executor:", coordinatorExecutor.toBase58());

    // --- Token accounts ---
    console.log("[12] Resolviendo token accounts...");
    const collateralAuthority = new PublicKey(contract.depositAddress);
    const collateralTokenAccount = await getAssociatedTokenAddress(mint, collateralAuthority, true);
    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, owner, mint, recipientPk
    );
    console.log("[13] Token accounts:", {
      collateralAuthority: collateralAuthority.toBase58(),
      collateralTokenAccount: collateralTokenAccount.toBase58(),
      destinationTokenAccount: destinationTokenAccount.address.toBase58(),
    });

    // --- Ed25519 verify ---
    console.log("[14] Construyendo coordinator message y verify instruction...");
    const coordinatorSignature = Buffer.from(executorPublisherSig, "base64");
    const coordinatorMessage = Coordinator.getWithdrawMessage(
      collateral, coordinatorPk, owner.publicKey, recipientPk,
      mint, withdrawRequest, nonce
    );
    const verifyCoordinatorIx = Ed25519ExtendedProgram.createSignatureVerificationInstruction([
      { signer: coordinatorExecutor, signature: coordinatorSignature, message: coordinatorMessage }
    ]);
    console.log("[15] Verify instruction construida OK");

    let tx: string;

    if (version === "v2_01") {
      console.log("[16] Ejecutando flujo v2_01 (CollateralV2 multisig)...");

      console.log("[16.1] Submitting collateral signature...");
      const collateralSignatureAddress = await submitCollateralSignature(
        owner, recipientPk, mint, withdrawRequest, nonce, program as any, collateral
      );
      console.log("[16.2] Collateral signature PDA:", collateralSignatureAddress.toBase58());

      console.log("[16.3] Enviando transacción withdrawCollateralAsset...");
      tx = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(
          verifyCoordinatorIx,
          await (program.methods as any)
            .withdrawCollateralAsset(withdrawRequest)
            .accounts({
              rentReceiver: owner.publicKey,
              sender: owner.publicKey,
              receiver: recipientPk,
              asset: mint,
              collateralTokenAccount,
              receiverTokenAccount: destinationTokenAccount.address,
              coordinator: coordinatorPk,
              collateral,
              collateralAdminSignatures: collateralSignatureAddress,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction()
        ),
        [owner],
        { commitment: "confirmed" }
      );
      console.log("[16.4] TX v2_01 confirmada:", tx);

    } else {
      console.log("[16] Ejecutando flujo v2_02 (SingleSignerCollateral)...");

      const withdrawRequestV2 = {
        amountInAsset: new BN(amountInCents),
        signatureExpirationTime: new BN(expiresAt),
        coordinatorSignatureSalt: Array.from(
          Buffer.from(executorPublisherSalt, "base64")
        ).slice(0, 32),
      };
      console.log("[16.1] WithdrawRequestV2:", {
        amountInAsset: withdrawRequestV2.amountInAsset.toString(),
        signatureExpirationTime: withdrawRequestV2.signatureExpirationTime.toString(),
        saltLength: withdrawRequestV2.coordinatorSignatureSalt.length,
      });

      console.log("[16.2] Enviando transacción withdrawSingleSignerCollateralAsset...");
      tx = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(
          verifyCoordinatorIx,
          await (program.methods as any)
            .withdrawSingleSignerCollateralAsset(withdrawRequestV2)
            .accounts({
              owner: owner.publicKey,
              coordinator: coordinatorPk,
              collateral,
              // collateralAuthority: Anchor lo deriva automáticamente por PDA
              destination: recipientPk,
              asset: mint,
              collateralTokenAccount,
              destinationTokenAccount: destinationTokenAccount.address,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction()
        ),
        [owner],
        { commitment: "confirmed" }
      );
      console.log("[16.3] TX v2_02 confirmada:", tx);
    }

    console.log("[17] Withdrawal exitoso. TX:", tx);
    return res.status(200).json({ success: true, tx });

  } catch (error: any) {
    console.error("WITHDRAW ERROR en paso desconocido:", error?.message || error);
    console.error("Stack:", error?.stack);
    return res.status(500).json({ success: false, message: error.message });
  }
};