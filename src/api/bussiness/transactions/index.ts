import { Router } from "express";
import { listTransactionsController } from "./getTransactions";
import { getTransactionController } from "./getTransactionsById"
import { createTransactionController } from "./createTransactions"
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();
// /api/business/transactions
router.get("/", authMiddleware, listTransactionsController);
// /api/business/transactions/:id
router.get("/:id", authMiddleware, getTransactionController);

router.post("/create", authMiddleware, createTransactionController);
export default router;
