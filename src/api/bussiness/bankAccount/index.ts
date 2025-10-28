import { Router } from "express";
import { createBankAccountController } from "./createBankAccount";
import { getBankAccountsByCustomerIdController } from "./getBankAccounts";
import { getBankAccountsByIdController } from "./getBankAccountById";
const router = Router();
// /api/business/counterparties/create
router.post("/create", createBankAccountController);
// /api/business/counterparties/:customerId/list
router.get("/:customerId/list", getBankAccountsByCustomerIdController);
// /api/business/counterparties/:id/info
router.get("/:id/info", getBankAccountsByIdController);
// /api/business/counterparties/update/:id
router.patch("/update/:id", getBankAccountsByIdController);
export default router;
