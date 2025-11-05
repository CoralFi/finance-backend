import { Router } from "express";
import { getBalancesController } from "./getBalances";
const router = Router();
router.get("/:conduitId", getBalancesController);

export default router;
