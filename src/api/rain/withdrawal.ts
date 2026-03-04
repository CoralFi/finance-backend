import { Response } from "express";
import { ethers } from "ethers";

import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";

import { RAIN_CHAINS } from "./utils/rainChains";
import { getAdminSignature } from "./utils/adminSignature";

import { CollateralInterface } from "@/lib/utils/abis/v2/Collateral";
import { CoordinatorInterface } from "@/lib/utils/abis/v2/Coordinator";
import { getRainUserByRainId } from "@/services/supabase/rainUser"
export const withdrawalController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currency, amount, recipientAddress } = req.body;
    console.log("Withdrawal request received:", {
      currency,
      amount,
      recipientAddress,
    });
    const customerId = req.user?.rain_id;
    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    const rainUser = await getRainUserByRainId(customerId!)
    if (!rainUser) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }
    if (!rainUser?.private_key) {
      res.status(400).json({
        success: false,
        message: "Usuario no tiene wallet generada",
      });
      return;
    }
    const contract = await apiRain.getContract(customerId);
    const chainId = contract[0].chainId;

    const environment =
      process.env.NODE_ENV === "production" ? "production" : "development";

    const selectedChain = Object.values(RAIN_CHAINS[environment]).find(
      (chain) => chain.chainId === Number(chainId)
    );

    if (!selectedChain) {
      res.status(400).json({
        success: false,
        message: "Chain no soportada",
      });
      return;
    }


    const tokenAddress =
      selectedChain.tokens[
      String(currency).toLowerCase() as keyof typeof selectedChain.tokens
      ];

    if (!tokenAddress) {
      res.status(400).json({
        success: false,
        message: "Moneda no soportada para esta red",
      });
      return;
    }

    const provider = new ethers.JsonRpcProvider(selectedChain.rpc);

    const signer = new ethers.Wallet(
      rainUser.private_key,
      provider
    );

    console.log("Admin signer:", signer.address);

    const params: Record<string, string> = {
      chainId,
      token: tokenAddress,
      amount,
      adminAddress: signer.address,
      recipientAddress,
    };

    const signature = await apiRain.getWithdrawalSignature(customerId, params);

    const [
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
      executorPublisherSalt,
      executorPublisherSig,
    ] = signature.parameters;

    console.log("Rain parameters:", {
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
    });


    const coordinatorContract = new ethers.Contract(
      contract[0].controllerAddress,
      CoordinatorInterface
    ).connect(signer);

    const collateralContract = new ethers.Contract(
      collateralProxy,
      CollateralInterface
    ).connect(signer);

    const withdrawAsset = coordinatorContract.getFunction("withdrawAsset");

    const adminNonceFunction = collateralContract.getFunction("adminNonce");
    const nonce = await adminNonceFunction.staticCallResult();

    console.log("Admin nonce:", nonce[0]);


    const { salt: adminSalt, signature: adminSignature } =
      await getAdminSignature({
        signer,
        amount: amountInCents,
        chainId: Number(chainId),
        collateralProxyAddress: collateralProxy,
        recipientAddress: recipient,
        tokenAddress: assetAddress,
        nonce: nonce[0],
      });

    console.log("Admin signature generated");

    const directTransfer = true;

    const functionInputs = [
      collateralProxy,
      assetAddress,
      amountInCents,
      recipient,
      expiresAt,
      ethers.hexlify(Buffer.from(executorPublisherSalt, "base64")),
      executorPublisherSig,
      [adminSalt],
      [adminSignature],
      directTransfer,
    ];

    console.log("Withdraw inputs ready");



    const tx = await withdrawAsset(...functionInputs);
    const receipt = await tx.wait();

    console.log("Withdraw TX:", tx.hash);

    res.status(200).json({
      success: true,

      txhash: tx.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status
    });
  } catch (error: any) {
    console.error(
      "Error en withdrawalController:",
      error.response?.data || error
    );

    res.status(500).json({
      success: false,
      message: error.response?.data || "Error interno del servidor",
    });
  }
};