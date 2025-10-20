import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";
import { listAccountPurposeController } from "./utilities/accountPurpose";

const router = Router();

router.get("/", listCustomersController);
router.get("/account-purposes", listAccountPurposeController);
router.get("/:customerId", getCustomerInfo);

export default router;