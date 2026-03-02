import { Router } from "express";
import { depositInstructionsController } from "./depositInstructions";
import { getAccountController } from "./getAccount"
import { listAccountsController } from "./listAccount"

import { linkKyb } from "./getLinkKyb"
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();
// /api/
router.get("/deposit/:id", authMiddleware, depositInstructionsController);
router.get("/:id", authMiddleware, getAccountController);
router.get("/", authMiddleware, listAccountsController);
router.get("/test/kyb", authMiddleware, linkKyb);
export default router;
