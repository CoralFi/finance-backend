import nacl from "tweetnacl";
import { randomBytes } from "crypto";
import { Keypair, PublicKey, sendAndConfirmTransaction } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Ed25519ExtendedProgram, MainV2_01 } from "./program";
import { Collateral, WithdrawCollateral } from "./eip712";

export async function submitCollateralSignature(
  sender: Keypair,
  recipientAddress: PublicKey,
  mintAddress: PublicKey,
  withdrawRequest: WithdrawCollateral,
  adminFundsNonce: number,
  program: Program<MainV2_01>,
  collateralAddress: PublicKey
): Promise<PublicKey> {
  const salt: number[] = Array.from(randomBytes(32)).map(Number);

  const message = Collateral.getWithdrawMessage(
    collateralAddress,
    sender.publicKey,
    recipientAddress,
    mintAddress,
    withdrawRequest,
    salt,
    adminFundsNonce
  );

  const signature = nacl.sign.detached(Uint8Array.from(message), sender.secretKey);

  const pda = Collateral.generateWithdrawCollateralPDA(
    collateralAddress,
    sender.publicKey,
    recipientAddress,
    mintAddress,
    withdrawRequest,
    adminFundsNonce,
    program.programId
  );

  const existing = await (program.account as any).collateralAdminSignaturesV2.fetchNullable(pda);
  if (
    !existing ||
    existing.signers.every((s: PublicKey) => !s.equals(sender.publicKey))
  ) {
    const verifyIx = Ed25519ExtendedProgram.createSignatureVerificationInstruction([
      { signer: sender.publicKey, signature: Buffer.from(signature), message },
    ]);

    const tx = await (program.methods as any)
      .submitSignatures({
        salts: [salt],
        targetNonce: adminFundsNonce,
        signatureSubmissionType: {
          withdrawCollateralAsset: {
            sender: sender.publicKey,
            receiver: recipientAddress,
            asset: mintAddress,
            withdrawRequest,
          },
        },
      })
      .accounts({
        collateral: collateralAddress,
        collateralAdminSignatures: pda,
        rentPayer: sender.publicKey,
      })
      .preInstructions([verifyIx])
      .transaction();

    const hash = await sendAndConfirmTransaction(
      program.provider.connection,
      tx,
      [sender],
      { commitment: "confirmed" }
    );
  }

  return pda;
}
