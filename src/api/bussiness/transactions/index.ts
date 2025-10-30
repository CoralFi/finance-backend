import { Router } from "express";
import { listTransactionsController } from "./getTransactions";
import { getTransactionController } from "./getTransactionsById"
const router = Router();
// /api/business/customers
router.get("/", listTransactionsController);
// /api/business/customers/:id
router.get("/:id", getTransactionController);
export default router;
