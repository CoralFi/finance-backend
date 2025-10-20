import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";
import { listAccountPurposeController } from "./utilities/accountPurpose";
import { amountToMoveController } from "./utilities/amountToMove";
import { employmentSituationController } from "./utilities/employmentSituation";

const router = Router();

router.get("/", listCustomersController);
router.get("/account-purposes", listAccountPurposeController);
router.get("/amount-to-move", amountToMoveController);
router.get("/employment-situation", employmentSituationController);
router.get("/:customerId", getCustomerInfo);

export default router;