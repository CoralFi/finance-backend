import { Router } from "express";
import { listTransactionsController } from "./getTransactions";
import { getTransactionController } from "./getTransactionsById"
import { createTransactionController } from "./createTransactions"
const router = Router();
// /api/business/customers
router.get("/", listTransactionsController);
// /api/business/customers/:id
router.get("/:id", getTransactionController);

router.post("/create", createTransactionController);
export default router;
