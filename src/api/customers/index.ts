import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";
import { getCustomerTotalInfoController } from "./getCustomerTotalInfo";
import { postCustomerInfoController } from "./postCustomerInfo";
import { getKycStatusController } from "./getKycStatus";
import { customerAddressController } from "./getCustomerAddress";
import { listAccountPurposeController } from "./utilities/accountPurpose";
import { amountToMoveController } from "./utilities/amountToMove";
import { employmentSituationController } from "./utilities/employmentSituation";
import { ocupationsController } from "./utilities/occupations";
import { sourceFoundController } from "./utilities/sourceFound";
import { FernKycUpdateController } from "./updateCustomerById";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();

// router.get("/", authMiddleware, listCustomersController);
// /api/customers/account-purposes
router.get("/account-purposes", authMiddleware, listAccountPurposeController);
// /api/customers/occupations
router.get("/occupations", authMiddleware, ocupationsController);
// /api/customers/amount-to-move
router.get("/amount-to-move", authMiddleware, amountToMoveController);
// /api/customers/source-found
router.get("/source-found", authMiddleware, sourceFoundController);
// /api/customers/employment-situation
router.get("/employment-situation", authMiddleware, employmentSituationController);
// /api/customers/kyc/:customerId/status
router.get("/kyc/status", authMiddleware, getKycStatusController);
// /api/customers/:customerId/info
router.get("/info", authMiddleware, getCustomerTotalInfoController);
router.post("/info", authMiddleware, postCustomerInfoController);
// /api/customers/:customerId/addresses
router.get("/addresses", authMiddleware, customerAddressController);
router.post("/addresses", authMiddleware, customerAddressController);
router.delete("/addresses", authMiddleware, customerAddressController);
// /api/customers/:customerId
router.get("/", authMiddleware, getCustomerInfo);

// /api/customers/kyc/update
router.post("/kyc/update", authMiddleware, FernKycUpdateController);

export default router;