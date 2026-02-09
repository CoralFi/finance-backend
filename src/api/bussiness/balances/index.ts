import { Router } from "express";
import { getBalancesController } from "./getBalances";
import { getBalancesSameController } from "./getBalancesSameName";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();
router.get("/", authMiddleware, getBalancesController);
router.get("/samename", authMiddleware, getBalancesSameController);

export default router;
