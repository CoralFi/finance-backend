import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";
import { getCustomerTotalInfoController } from "./getCustomerTotalInfo";
import { customerAddressController } from "./getCustomerAddress";
import { listAccountPurposeController } from "./utilities/accountPurpose";
import { amountToMoveController } from "./utilities/amountToMove";
import { employmentSituationController } from "./utilities/employmentSituation";
import { ocupationsController } from "./utilities/occupations";
import { sourceFoundController } from "./utilities/sourceFound";

const router = Router();

router.get("/", listCustomersController);
// /api/customers/account-purposes
router.get("/account-purposes", listAccountPurposeController);
// /api/customers/occupations
router.get("/occupations", ocupationsController);
// /api/customers/amount-to-move
router.get("/amount-to-move", amountToMoveController);
// /api/customers/source-found
router.get("/source-found", sourceFoundController);
// /api/customers/employment-situation
router.get("/employment-situation", employmentSituationController);
// /api/customers/:customerId/info
router.get("/:customerId/info", getCustomerTotalInfoController);
// /api/customers/:customerId/addresses
router.get("/:customerId/addresses", customerAddressController);
router.post("/:customerId/addresses", customerAddressController);
router.delete("/:customerId/addresses", customerAddressController);
// /api/customers/:customerId
router.get("/:customerId", getCustomerInfo);


export default router;