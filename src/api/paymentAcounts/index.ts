import { Router } from "express";
import { getBalanceController } from "./balance";
import { createPaymentAccountController } from "./createAcount";
import { listPaymentAccountsController } from "./listPaymentAccounts";
import { deletePaymentAccountController } from "./deletePaymentAccount";
const router = Router();

// Dynamic route: /payment-accounts/:paymentAccountId/balance
router.get("/:paymentAccountId/balance", getBalanceController);
router.post("/", createPaymentAccountController);
router.get("/", listPaymentAccountsController);
router.delete("/", deletePaymentAccountController);
export default router;
