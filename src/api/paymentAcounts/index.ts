import { Router } from "express";
import { getBalanceController } from "./balance";

const router = Router();

// Dynamic route: /payment-accounts/:paymentAccountId/balance
router.get("/:paymentAccountId/balance", getBalanceController);

export default router;