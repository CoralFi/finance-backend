import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";
import { RAIN_CHAINS } from "./utils/rainChains";

export const getContract = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.customer_id;
    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    const rainUser = await getRainUserByCustomerId(customerId);
    if (!rainUser || !rainUser.rain_user_id) {
      res.status(404).json({
        success: false,
        message: "Rain user no encontrado para este customer",
      });
      return;
    }


    const contract = await apiRain.getContract(rainUser.rain_user_id);
    console.log("Contract data from Rain API:", contract);
    const environment =
      process.env.NODE_ENV === "production" ? "production" : "development";

    const enrichedContract = contract.map((item: any) => {
      const chainEntry = Object.entries(RAIN_CHAINS[environment]).find(
        ([, chain]) => chain.chainId === Number(item.chainId)
      );

      const network = chainEntry?.[0] ?? "unknown";
      const chainConfig = chainEntry?.[1];

      const tokens = Array.isArray(item.tokens)
        ? item.tokens.map((token: any) => {
            const currency = chainConfig
              ? Object.entries(chainConfig.tokens).find(
                  ([, address]) =>
                    address?.toLowerCase() === String(token.address).toLowerCase()
                )?.[0] ?? null
              : null;

            return {
              ...token,
              currency,
            };
          })
        : item.tokens;

      return {
        ...item,
        network,
        tokens,
      };
    });

    res.status(200).json({
      success: true,
      card: enrichedContract,
    });
  } catch (error: unknown) {
    console.error("Error en getContract:", error);

    const message = error instanceof Error ? error.message : "Error interno del servidor";

    res.status(500).json({
      success: false,
      message,
    });
  }
};
