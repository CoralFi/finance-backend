import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"

import paymentAcountsRoutes from "./paymentAcounts/index"
const router = Router();

router.use("/test", testRoutes);
router.use("/auth", loginRoutes);
router.use("/payment-accounts", paymentAcountsRoutes);

export default router;
