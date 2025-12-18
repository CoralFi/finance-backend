import { Router } from "express";
import { listTransactionsController } from "./getTransactions";
import { getTransactionController } from "./getTransactionsById"
import { createTransactionController } from "./createTransactions"
const router = Router();
// /api/business/transactions
router.get("/:customer_id", listTransactionsController);
// /api/business/transactions/:id
router.get("/:id", getTransactionController);

router.post("/create", createTransactionController);
export default router;
