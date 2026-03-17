import { Response } from "express";
import apiRain from "@/services/rain/apiRain";

import { AuthRequest } from "../../middleware/authMiddleware";
export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.rain_id;
    if (!customerId) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }
    const transactions = await apiRain.getTransationsByUserId(customerId);

    const transactionsWithMovement = Array.isArray(transactions)
      ? transactions.map((transaction: any) => {
          const amount = Number(transaction?.collateral?.amount);
          const movement = Number.isFinite(amount) && amount >= 0 ? "deposito" : "retiro";

          return {
            ...transaction,
            collateral: transaction?.collateral
              ? {
                  ...transaction.collateral,
                  movement,
                }
              : transaction?.collateral,
          };
        })
      : transactions;

    res.status(200).json({
      success: true,
      transactions: transactionsWithMovement

    });

  } catch (error: any) {
    console.error("Error en kycStatus:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
