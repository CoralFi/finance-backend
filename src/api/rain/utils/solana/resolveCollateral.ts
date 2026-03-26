import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { IdlV2_01, MainV2_01 } from "./program/v2_01";
import { IdlV2_02, MainV2_02 } from "./program/v2_02";

// Discriminators sacados de tus IDLs
const DISC_COLLATERAL_V2        = Buffer.from([165, 86, 67, 157, 199, 120, 39, 111]);
const DISC_SINGLE_SIGNER        = Buffer.from([19, 45, 99, 29, 196, 50, 228, 117]);

export type CollateralVersion = "v2_01" | "v2_02_single";

export async function resolveCollateralVersion(
  connection: Connection,
  owner: Keypair,
  programAddress: string,
  collateralAddress: PublicKey
): Promise<{
  version: CollateralVersion;
  program: Program<MainV2_01> | Program<MainV2_02>;
  coordinator: PublicKey;
  nonce: number;
}> {
  const accountInfo = await connection.getAccountInfo(collateralAddress);
  if (!accountInfo) throw new Error("Collateral account not found");

  const disc = accountInfo.data.slice(0, 8);
  const provider = new AnchorProvider(
    connection,
    new Wallet(owner),
    AnchorProvider.defaultOptions()
  );

  if (Buffer.from(disc).equals(DISC_COLLATERAL_V2)) {
    // --- v2_01: CollateralV2 (multisig) ---
    const idl: any = Object.assign({}, IdlV2_01, { address: programAddress });
    const program = new Program<MainV2_01>(idl, provider);
    const account = await program.account.collateralV2.fetch(collateralAddress);
    return {
      version: "v2_01",
      program,
      coordinator: account.coordinator,
      nonce: account.adminFundsNonce,
    };

  } else if (Buffer.from(disc).equals(DISC_SINGLE_SIGNER)) {
    // --- v2_02: SingleSignerCollateral ---
    const idl: any = Object.assign({}, IdlV2_02, { address: programAddress });
    const program = new Program<MainV2_02>(idl, provider);
    const account = await program.account.singleSignerCollateral.fetch(collateralAddress);
    return {
      version: "v2_02_single",
      program,
      coordinator: account.coordinator,
      nonce: account.nonce,
    };

  } else {
    throw new Error(
      `Unknown collateral discriminator: [${Array.from(disc)}]. ` +
      `Puede ser una versión nueva del programa de Rain.`
    );
  }
}