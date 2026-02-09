import supabase from "../../../db/supabase";
import { FernKycStatus, getFernWalletCryptoInfo } from "@/services/fern/fernServices";
import { FernUser } from "@/services/types/types";

/**tiene
 * Transforms raw database Fern data to FernUser interface
 * Converts lowercase field names to camelCase
 * @param rawFernData - Raw data from database
 * @returns FernUser object or undefined
 */
export const transformFernData = (rawFernData: any): FernUser | undefined => {
  if (!rawFernData) return undefined;
  
  return {
    customer_id: rawFernData.customer_id,
    fernCustomerId: rawFernData.ferncustomerid,
    fernWalletId: rawFernData.fernwalletid,
    kyc: rawFernData.kyc,
    kycStatus: rawFernData.kycstatus || rawFernData.kyc,
    businessname: rawFernData.businessname,
    organizationid: rawFernData.organizationid
  };
};

/**
 * Fetches Fern user data from database
 * @param customerId - Customer ID
 * @returns Transformed FernUser data or undefined
 */
export const getFernData = async (customerId: number): Promise<FernUser | undefined> => {
  const { data: fern, error: fernError } = await supabase
    .rpc("get_fern_user_info", { p_customer_id: customerId })
    .single() as { data: any, error: any };

  if (fernError) {
    console.warn("Error buscando datos Fern:", fernError.message);
  }

  return transformFernData(fern);
};

/**
 * Fetches Fern-related data (KYC status and wallet info) in parallel
 * @param fernData - FernUser data
 * @param userId - User ID for KYC lookup
 * @returns Object with kycStatus, kycLink, and walletAddress
 */
export const fetchFernRelatedData = async (fernData?: FernUser, userId?: number) => {
  if (!fernData?.fernCustomerId) {
    return {
      kycStatus: null,
      kycLink: null,
      walletAddress: null
    };
  }

  const promises = [
    // KYC Status
    FernKycStatus(fernData.fernCustomerId, userId?.toString() || "").catch((error) => {
      console.error("Error con Fern KYC:", error.message);
      return { kycStatus: null, kycLink: null };
    }),
    // Wallet Info
    fernData.fernWalletId
      ? getFernWalletCryptoInfo(fernData.fernWalletId).catch((error) => {
          console.error("Error obteniendo info de billetera Fern:", error.message);
          return null;
        })
      : Promise.resolve(null)
  ];

  const [kycData, walletInfo] = await Promise.all(promises);

  return {
    kycStatus: (kycData as any)?.kycStatus || null,
    kycLink: (kycData as any)?.kycLink || null,
    walletAddress: walletInfo?.fernCryptoWallet?.address || null
  };
};
