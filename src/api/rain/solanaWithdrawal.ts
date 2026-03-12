import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";

import axios from "axios";
import nacl from "tweetnacl";
import { randomBytes } from "crypto";
import crypto from "crypto-js";

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";

import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";

import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  Account
} from "@solana/spl-token";

import { Ed25519ExtendedProgram, IdlV2_01, MainV2_01 } from "./program";

import { RAIN_CHAINS } from "./utils/rainChains";

import apiRain from "@/services/rain/apiRain";
import { getRainUserByRainId } from "@/services/supabase/rainUser";

const BASE_URL = "https://api-dev.raincards.xyz";

export const withdrawalSolanaController = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    console.log("STEP 1 — request received");

    const { currency, amount, recipientAddress } = req.body;

    const rainUserId = req.user?.rain_id;

    if (!rainUserId) throw new Error("Usuario no autenticado");

    console.log("STEP 2 — getting rain user");

    const rainUser = await getRainUserByRainId(rainUserId);

    if (!rainUser?.solana_key) throw new Error("Usuario no tiene wallet");

    console.log("STEP 3 — loading owner keypair");

    const secret = Buffer.from(rainUser.solana_key, "base64");
    const owner = Keypair.fromSecretKey(new Uint8Array(secret));

    console.log("Owner:", owner.publicKey.toBase58());

    console.log("STEP 4 — get contracts");

    const contracts = await apiRain.getContract(rainUserId);
    const contract = contracts[0];

    const chainId = contract.chainId;

    console.log("ChainId:", chainId);

    console.log("STEP 5 — selecting chain config");

    const environment =
      process.env.NODE_ENV === "production" ? "production" : "development";

    const selectedChain = Object.values(RAIN_CHAINS[environment]).find(
      (chain) => chain.chainId === Number(chainId)
    );

    if (!selectedChain) throw new Error("Chain no soportada");

    console.log("RPC:", selectedChain.rpc);

    console.log("STEP 6 — resolving token address");

    const tokenAddress =
      selectedChain.tokens[
      String(currency).toLowerCase() as keyof typeof selectedChain.tokens
      ];

    if (!tokenAddress) throw new Error("Token no soportado");

    console.log("Token:", tokenAddress);

    console.log("STEP 7 — requesting Rain signature");

    const params = {
      token: tokenAddress,
      amount,
      adminAddress: owner.publicKey.toBase58(),
      recipientAddress,
      chainId
    };

    const signatureResponse = await axios.get(
      `${BASE_URL}/v1/issuing/users/${rainUserId}/signatures/withdrawals`,
      {
        headers: {
          "Api-Key": process.env.RAIN_API_KEY
        },
        params
      }
    );

    const signature = signatureResponse.data;

    console.log("STEP 8 — decoding signature");

    const [
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
      executorPublisherSalt,
      executorPublisherSig
    ] = signature.parameters;

    console.log("Collateral:", collateralProxy);

    console.log("STEP 9 — loading connection");

    const connection = new Connection(selectedChain.rpc, "confirmed");

    console.log("STEP 10 — loading program");

    const idl: any = Object.assign(IdlV2_01, {
      address: contract.programAddress
    });

    const provider = new AnchorProvider(
      connection,
      new Wallet(owner),
      AnchorProvider.defaultOptions()
    );

    const program = new Program<MainV2_01>(idl, provider);

    console.log("Program:", contract.programAddress);

    console.log("STEP 11 — preparing accounts");

    const collateral = new PublicKey(collateralProxy);
    const mint = new PublicKey(assetAddress);
    const recipientPk = new PublicKey(recipient);

    console.log("STEP 12 — fetch collateral account");

    const collateralAccount = await program.account.collateralV2.fetch(collateral);

    console.log("STEP 13 — fetch coordinator");

    const coordinator = await program.account.coordinator.fetch(
      collateralAccount.coordinator
    );

    const coordinatorExecutor = coordinator.executors[0];

    console.log("Coordinator executor:", coordinatorExecutor.toBase58());

    console.log("STEP 14 — preparing token accounts");

    const collateralTokenAccount = await getAssociatedTokenAddress(
      mint,
      new PublicKey(contract.depositAddress),
      true
    );

    const destinationTokenAccount =
      await getOrCreateAssociatedTokenAccount(
        connection,
        owner,
        mint,
        recipientPk
      );

    console.log("Destination ATA:", destinationTokenAccount.address.toBase58());

    console.log("STEP 15 — building withdraw request");

    const withdrawRequest = {
      amountOfAsset: new BN(amountInCents),
      signatureExpirationTime: new BN(expiresAt),
      coordinatorSignatureSalt: Array.from(
        Buffer.from(executorPublisherSalt, "base64")
      )
    };

    console.log("STEP 15.5 — submitting collateral admin signature");

    const collateralSignatureAddress = await submitCollateralSignature(
      owner,
      recipientPk,
      mint,
      withdrawRequest,
      collateralAccount.adminFundsNonce,
      program,
      collateral
    );

    console.log("Collateral signature PDA:", collateralSignatureAddress.toBase58());

    console.log("STEP 16 — building transaction");

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

    const balance = await connection.getBalance(owner.publicKey);
    console.log("SOL balance:", balance / 1e9);
    const contractTokenBalance = await connection.getTokenAccountBalance(collateralTokenAccount);
    console.log("Contract token balance:", contractTokenBalance.value.uiAmountString);

    const tx = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(

        // verificación de firma del coordinator
        Ed25519ExtendedProgram.createSignatureVerificationInstruction([
          {
            signer: coordinatorExecutor,
            signature: coordinatorSignature,
            message: coordinatorMessage
          }
        ]),

        // instrucción withdraw
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

    console.log("STEP 17 — withdrawal success");

    return res.status(200).json({
      success: true,
      tx
    });

  } catch (error: any) {

    console.error("WITHDRAW ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
// ---- EIP712 Helpers ----

class HashUtils {
  static keccak256Hex(data: string): string {
    const wordArray = crypto.enc.Hex.parse(data);
    const hash = crypto.SHA3(wordArray, { outputLength: 256 });
    return hash.toString();
  }

  static keccak256(data: string): string {
    const hash = crypto.SHA3(data, { outputLength: 256 });
    return hash.toString();
  }

  static encodeString(value: string): string {
    return HashUtils.keccak256(value);
  }

  static encodeAddress(value: PublicKey): string {
    return value.toBuffer().toString('hex');
  }

  static encodeUInt32(value: bigint | number): string {
    return value.toString(16).padStart(8, '0');
  }

  static encodeUInt64(value: bigint): string {
    return value.toString(16).padStart(16, '0');
  }

  static encodeBytes(value: Uint8Array): string {
    return Array.from(value).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

class PaddingBytesMessage {
  static encode(): string {
    return HashUtils.encodeBytes(new Uint8Array(Buffer.from('\x19\x01', 'latin1')));
  }
}

class DomainSeparatorMessage {
  private static DOMAIN_TYPE_HASH = HashUtils.encodeString('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)');

  static encode(
    name: string,
    version: string,
    chainId: bigint,
    verifyingContract: PublicKey,
    salt: Uint8Array,
  ): string {
    const encodedStructure = [
      DomainSeparatorMessage.DOMAIN_TYPE_HASH,
      HashUtils.encodeString(name),
      HashUtils.encodeString(version),
      HashUtils.encodeUInt64(chainId),
      HashUtils.encodeAddress(verifyingContract),
      HashUtils.encodeBytes(salt),
    ].join('');
    return HashUtils.keccak256Hex(encodedStructure);
  }
}

type WithdrawCollateral = {
  amountOfAsset: BN;
  signatureExpirationTime: BN;
  coordinatorSignatureSalt: number[];
}

class Collateral {
  private static COLLATERAL_ADMIN_SIGNATURE_SEED = Buffer.from('CollateralAdminSignatures', 'utf-8');
  private static WITHDRAW_TYPE_HASH = HashUtils.encodeString('Withdraw(address user,address asset,uint256 amount,address recipient,uint256 nonce)');

  static generateAdminSignaturePDA(collateral: PublicKey, id: Buffer, programId: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Collateral.COLLATERAL_ADMIN_SIGNATURE_SEED, collateral.toBuffer(), id],
      programId,
    );
    return pda;
  }

  static generateWithdrawCollateralPDA(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    request: WithdrawCollateral,
    adminFundsNonce: number,
    programId: PublicKey,
  ): PublicKey {
    const encoded = Collateral.encodeWithdrawMessage(collateral, sender, receiver, asset, request, adminFundsNonce);
    const id = Buffer.from(encoded, 'hex');
    return Collateral.generateAdminSignaturePDA(collateral, id, programId);
  }

  static getWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    salt: number[],
    adminFundsNonce: number,
  ): Buffer {
    const encodedData = [
      PaddingBytesMessage.encode(),
      DomainSeparatorMessage.encode('Collateral', '2', 900n, collateral, new Uint8Array(salt)),
      Collateral.encodeWithdrawMessage(collateral, sender, receiver, asset, withdraw, adminFundsNonce),
    ].join('');
    return Buffer.from(HashUtils.keccak256Hex(encodedData), 'hex');
  }

  static encodeWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    adminFundsNonce: number,
  ): string {
    const amount = BigInt(withdraw.amountOfAsset.toString());
    const encodedStructure = [
      Collateral.WITHDRAW_TYPE_HASH,
      HashUtils.encodeAddress(sender),
      HashUtils.encodeAddress(collateral),
      HashUtils.encodeAddress(asset),
      HashUtils.encodeUInt64(amount),
      HashUtils.encodeAddress(receiver),
      HashUtils.encodeUInt32(adminFundsNonce),
    ].join('');
    return HashUtils.keccak256Hex(encodedStructure);
  }
}

class Coordinator {
  private static WITHDRAW_TYPE_HASH = HashUtils.encodeString('Withdraw(address user,address collateral,address asset,uint256 amount,address recipient,uint256 nonce,uint256 expiresAt)');

  static encodeWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdrawRequest: WithdrawCollateral,
    adminFundsNonce: number,
  ): string {
    const amount = BigInt(withdrawRequest.amountOfAsset.toString());
    const expiresAt = BigInt(withdrawRequest.signatureExpirationTime.toString());
    const encodedStructure = [
      Coordinator.WITHDRAW_TYPE_HASH,
      HashUtils.encodeAddress(sender),
      HashUtils.encodeAddress(collateral),
      HashUtils.encodeAddress(asset),
      HashUtils.encodeUInt64(amount),
      HashUtils.encodeAddress(receiver),
      HashUtils.encodeUInt32(adminFundsNonce),
      HashUtils.encodeUInt64(expiresAt),
    ].join('');
    return HashUtils.keccak256Hex(encodedStructure);
  }

  static getWithdrawMessage(
    collateral: PublicKey,
    coordinator: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    adminFundsNonce: number,
  ): Buffer {
    const encodedData = [
      PaddingBytesMessage.encode(),
      DomainSeparatorMessage.encode('Coordinator', '2', 900n, coordinator, new Uint8Array(withdraw.coordinatorSignatureSalt)),
      Coordinator.encodeWithdrawMessage(collateral, sender, receiver, asset, withdraw, adminFundsNonce),
    ].join('');
    return Buffer.from(HashUtils.keccak256Hex(encodedData), 'hex');
  }
}

async function submitCollateralSignature(
  sender: Keypair,
  recipientAddress: PublicKey,
  mintAddress: PublicKey,
  withdrawRequest: WithdrawCollateral,
  adminFundsNonce: number,
  program: Program<MainV2_01>,
  collateralAddress: PublicKey
): Promise<PublicKey> {
  const collateralMessageSalt: number[] = Array.from(randomBytes(32)).map(Number);

  const collateralMessage = Collateral.getWithdrawMessage(
    collateralAddress,
    sender.publicKey,
    recipientAddress,
    mintAddress,
    withdrawRequest,
    collateralMessageSalt,
    adminFundsNonce
  );

  const collateralSignature = nacl.sign.detached(
    Uint8Array.from(collateralMessage),
    sender.secretKey
  );

  const collateralSignatureAddress = Collateral.generateWithdrawCollateralPDA(
    collateralAddress,
    sender.publicKey,
    recipientAddress,
    mintAddress,
    withdrawRequest,
    adminFundsNonce,
    program.programId
  );

  const collateralSignatureAccount = await (program.account as any).collateralAdminSignaturesV2.fetchNullable(collateralSignatureAddress);
  if (!collateralSignatureAccount || collateralSignatureAccount.signers.every((s: PublicKey) => !s.equals(sender.publicKey))) {
    const signatureVerificationInstruction = Ed25519ExtendedProgram.createSignatureVerificationInstruction([{
      signer: sender.publicKey,
      signature: Buffer.from(collateralSignature),
      message: collateralMessage,
    }]);

    const transaction = await (program.methods as any).submitSignatures({
      salts: [collateralMessageSalt],
      targetNonce: adminFundsNonce,
      signatureSubmissionType: {
        withdrawCollateralAsset: {
          sender: sender.publicKey,
          receiver: recipientAddress,
          asset: mintAddress,
          withdrawRequest,
        }
      },
    }).accounts({
      collateral: collateralAddress,
      collateralAdminSignatures: collateralSignatureAddress,
      rentPayer: sender.publicKey,
    }).preInstructions([signatureVerificationInstruction]).transaction();

    const submitHash = await sendAndConfirmTransaction(
      program.provider.connection,
      transaction,
      [sender],
      { commitment: 'confirmed' }
    );

    console.log("Collateral admin signature submitted:", submitHash);
  }

  return collateralSignatureAddress;
}