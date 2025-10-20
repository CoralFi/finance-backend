import { Router } from "express";
import { getBalanceController } from "./balance";
import { createPaymentAccountController } from "./createAcount";
import { listPaymentAccountsController } from "./listPaymentAccounts";
import { deletePaymentAccountController } from "./deletePaymentAccount";
import { getPaymentAccountInfoController } from "./PaymentAccountInfo";
const router = Router();

// Dynamic route: /payment-accounts/:paymentAccountId/balance
router.get("/:paymentAccountId/balance", getBalanceController);

// Dynamic route: /payment-accounts/:paymentAccountId/info
router.get("/:paymentAccountId/info", getPaymentAccountInfoController);

// CRUD routes
// /api/payment-accounts
router.post("/", createPaymentAccountController);
router.get("/", listPaymentAccountsController);
router.delete("/", deletePaymentAccountController);
export default router;
