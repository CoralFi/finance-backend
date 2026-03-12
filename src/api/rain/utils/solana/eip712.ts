import crypto from "crypto-js";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export type WithdrawCollateral = {
  amountOfAsset: BN;
  signatureExpirationTime: BN;
  coordinatorSignatureSalt: number[];
};

export class HashUtils {
  static keccak256Hex(data: string): string {
    const wordArray = crypto.enc.Hex.parse(data);
    return crypto.SHA3(wordArray, { outputLength: 256 }).toString();
  }

  static keccak256(data: string): string {
    return crypto.SHA3(data, { outputLength: 256 }).toString();
  }

  static encodeString(value: string): string {
    return HashUtils.keccak256(value);
  }

  static encodeAddress(value: PublicKey): string {
    return value.toBuffer().toString("hex");
  }

  static encodeUInt32(value: bigint | number): string {
    return value.toString(16).padStart(8, "0");
  }

  static encodeUInt64(value: bigint): string {
    return value.toString(16).padStart(16, "0");
  }

  static encodeBytes(value: Uint8Array): string {
    return Array.from(value)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

class PaddingBytesMessage {
  static encode(): string {
    return HashUtils.encodeBytes(
      new Uint8Array(Buffer.from("\x19\x01", "latin1"))
    );
  }
}

class DomainSeparatorMessage {
  private static DOMAIN_TYPE_HASH = HashUtils.encodeString(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"
  );

  static encode(
    name: string,
    version: string,
    chainId: bigint,
    verifyingContract: PublicKey,
    salt: Uint8Array
  ): string {
    const encodedStructure = [
      DomainSeparatorMessage.DOMAIN_TYPE_HASH,
      HashUtils.encodeString(name),
      HashUtils.encodeString(version),
      HashUtils.encodeUInt64(chainId),
      HashUtils.encodeAddress(verifyingContract),
      HashUtils.encodeBytes(salt),
    ].join("");
    return HashUtils.keccak256Hex(encodedStructure);
  }
}

export class Collateral {
  private static COLLATERAL_ADMIN_SIGNATURE_SEED = Buffer.from(
    "CollateralAdminSignatures",
    "utf-8"
  );
  private static WITHDRAW_TYPE_HASH = HashUtils.encodeString(
    "Withdraw(address user,address asset,uint256 amount,address recipient,uint256 nonce)"
  );

  static generateAdminSignaturePDA(
    collateral: PublicKey,
    id: Buffer,
    programId: PublicKey
  ): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Collateral.COLLATERAL_ADMIN_SIGNATURE_SEED, collateral.toBuffer(), id],
      programId
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
    programId: PublicKey
  ): PublicKey {
    const encoded = Collateral.encodeWithdrawMessage(
      collateral,
      sender,
      receiver,
      asset,
      request,
      adminFundsNonce
    );
    return Collateral.generateAdminSignaturePDA(
      collateral,
      Buffer.from(encoded, "hex"),
      programId
    );
  }

  static getWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    salt: number[],
    adminFundsNonce: number
  ): Buffer {
    const encodedData = [
      PaddingBytesMessage.encode(),
      DomainSeparatorMessage.encode(
        "Collateral",
        "2",
        900n,
        collateral,
        new Uint8Array(salt)
      ),
      Collateral.encodeWithdrawMessage(
        collateral,
        sender,
        receiver,
        asset,
        withdraw,
        adminFundsNonce
      ),
    ].join("");
    return Buffer.from(HashUtils.keccak256Hex(encodedData), "hex");
  }

  static encodeWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    adminFundsNonce: number
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
    ].join("");
    return HashUtils.keccak256Hex(encodedStructure);
  }
}

export class Coordinator {
  private static WITHDRAW_TYPE_HASH = HashUtils.encodeString(
    "Withdraw(address user,address collateral,address asset,uint256 amount,address recipient,uint256 nonce,uint256 expiresAt)"
  );

  static encodeWithdrawMessage(
    collateral: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdrawRequest: WithdrawCollateral,
    adminFundsNonce: number
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
    ].join("");
    return HashUtils.keccak256Hex(encodedStructure);
  }

  static getWithdrawMessage(
    collateral: PublicKey,
    coordinator: PublicKey,
    sender: PublicKey,
    receiver: PublicKey,
    asset: PublicKey,
    withdraw: WithdrawCollateral,
    adminFundsNonce: number
  ): Buffer {
    const encodedData = [
      PaddingBytesMessage.encode(),
      DomainSeparatorMessage.encode(
        "Coordinator",
        "2",
        900n,
        coordinator,
        new Uint8Array(withdraw.coordinatorSignatureSalt)
      ),
      Coordinator.encodeWithdrawMessage(
        collateral,
        sender,
        receiver,
        asset,
        withdraw,
        adminFundsNonce
      ),
    ].join("");
    return Buffer.from(HashUtils.keccak256Hex(encodedData), "hex");
  }
}
