import { Router } from "express";
import { getBalanceController } from "./balance";
import { createPaymentAccountController } from "./createAcount";
import { listPaymentAccountsController } from "./listPaymentAccounts";
import { deletePaymentAccountController } from "./deletePaymentAccount";
import { getPaymentAccountInfoController } from "./PaymentAccountInfo";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();

// Dynamic route: /payment-accounts/:paymentAccountId/balance
router.get("/:paymentAccountId/balance", authMiddleware, getBalanceController);

// Dynamic route: /payment-accounts/:paymentAccountId/info
router.get("/:paymentAccountId/info", authMiddleware, getPaymentAccountInfoController);

// CRUD routes
// /api/payment-accounts
router.post("/", authMiddleware, createPaymentAccountController);
router.get("/", authMiddleware, listPaymentAccountsController);
router.delete("/", authMiddleware, deletePaymentAccountController);
export default router;
