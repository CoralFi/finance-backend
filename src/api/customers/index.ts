import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";
import { getCustomerTotalInfoController } from "./getCustomerTotalInfo";
import { listAccountPurposeController } from "./utilities/accountPurpose";
import { amountToMoveController } from "./utilities/amountToMove";
import { employmentSituationController } from "./utilities/employmentSituation";

const router = Router();

router.get("/", listCustomersController);
router.get("/account-purposes", listAccountPurposeController);
router.get("/amount-to-move", amountToMoveController);
router.get("/employment-situation", employmentSituationController);
// /api/customers/:customerId/info
router.get("/:customerId/info", getCustomerTotalInfoController);
// /api/customers/:customerId
router.get("/:customerId", getCustomerInfo);

export default router;