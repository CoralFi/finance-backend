import { Router } from "express";
import { createBankAccountController } from "./createBankAccount";
import { getBankAccountsByCustomerIdController } from "./getBankAccounts";
import { getBankAccountsByIdController } from "./getBankAccountById";
import { updateBankAccountController } from "./updateBankAccount";
import { deleteBankAccountController } from "./deleteBankAccount";
const router = Router();
// /api/business/counterparties/create
router.post("/create", createBankAccountController);
// /api/business/counterparties/:customerId/list
router.get("/:customerId/list/:currency", getBankAccountsByCustomerIdController);
// /api/business/counterparties/:id/info
router.get("/:id/info", getBankAccountsByIdController);
// /api/business/counterparties/update/:id
router.patch("/update/:id", updateBankAccountController);
// /api/business/counterparties/delete/:id/:paymentMethodId
router.delete("/delete/:id/:paymentMethodId", deleteBankAccountController);
export default router;
