import { Router } from "express";
import { getBalancesController } from "./getBalances";
import { getBalancesSameController } from "./getBalancesSameName";
const router = Router();
router.get("/:conduitId", getBalancesController);
router.get("/:conduitId/samename", getBalancesSameController);

export default router;
