import { Router } from "express";
import { listTransactionsController } from "./listTransactions";

const router = Router();
// List transactions
// api/transactions
router.get("/", listTransactionsController);

export default router;