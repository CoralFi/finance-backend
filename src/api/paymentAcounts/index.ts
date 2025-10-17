import { Router } from "express";
import { createPaymentAccountController } from "./createAcount";
import { listPaymentAccountsController } from "./listPaymentAccounts";
import { deletePaymentAccountController } from "./deletePaymentAccount";
const router = Router();
router.post("/", createPaymentAccountController);
router.get("/", listPaymentAccountsController);
router.delete("/", deletePaymentAccountController);
export default router;
