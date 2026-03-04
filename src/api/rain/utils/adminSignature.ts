import { Signer, randomBytes } from "ethers";
type AdminSignatureOpts = {
  signer: Signer;
  chainId: number;
  collateralProxyAddress: string;
  recipientAddress: string;
  amount: number;
  tokenAddress: string;
  nonce: number;
};

/**
 * Gets admin signature needed to resolve on coordinator contract
 * @param opts
 * @returns
 */
export const getAdminSignature = async (opts: AdminSignatureOpts) => {
  const { collateralProxyAddress, signer, chainId, tokenAddress, amount, recipientAddress, nonce } = opts;

  const salt = randomBytes(32);
  const domain = {
    name: "Collateral",
    version: "2",
    chainId: chainId as number,
    verifyingContract: collateralProxyAddress,
    salt,
  };
  const type = {
    Withdraw: [
      { name: "user", type: "address" },
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };
  const signerAddress = await signer.getAddress();
  const data = {
    user: signerAddress,
    asset: tokenAddress,
    amount,
    recipient: recipientAddress,
    nonce,
  };
  const signature = await signer.signTypedData(domain, type, data);
  return { salt, signature };
};