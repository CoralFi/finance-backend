import { Router } from "express";
import { createBankAccountController } from "./createBankAccount";
import { getBankAccountsByCustomerIdController } from "./getBankAccounts";
import { getBankAccountsByIdController } from "./getBankAccountById";
import { updateBankAccountController } from "./updateBankAccount";
import { deleteBankAccountController } from "./deleteBankAccount";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();
// /api/business/counterparties/create
router.post("/create", createBankAccountController);
// /api/business/counterparties/:customerId/list
router.get("/list/:currency", authMiddleware, getBankAccountsByCustomerIdController);
// /api/business/counterparties/:id/info
router.get("/:id/info", authMiddleware, getBankAccountsByIdController);
// /api/business/counterparties/update/:id
router.patch("/update/:id", authMiddleware, updateBankAccountController);
// /api/business/counterparties/delete/:id/:paymentMethodId
router.delete("/delete/:id/:paymentMethodId", authMiddleware, deleteBankAccountController);
export default router;
