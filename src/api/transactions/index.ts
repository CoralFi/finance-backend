import { Router } from "express";
import { listTransactionsController } from "./listTransactions";
import { createTransactionController } from "./createTransaction";

const router = Router();

/**
 * @route GET /api/transactions
 * @description List all transactions
 * @access Private
 */
router.get("/", listTransactionsController);

/**
 * @route POST /api/transactions
 * @description Create a new transaction from a quote
 * @access Private
 */
router.post("/", createTransactionController);

export default router;