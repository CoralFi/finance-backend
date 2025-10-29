import { Router } from "express";
import { depositInstructionsController } from "./depositInstructions";
import { getAccountController } from "./getAccount"
import { listAccountsController } from "./listAccount"
const router = Router();
router.get("/deposit/:id", depositInstructionsController);
router.get("/:id", getAccountController);

router.get("/", listAccountsController);
export default router;
