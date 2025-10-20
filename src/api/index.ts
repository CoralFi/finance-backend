import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"
import paymentAccountsRoutes from "./paymentAcounts/index";
import otpRoutes from "./otp/index";
import customersRoutes from "./customers/index";
import transactionsRoutes from "./transactions/index";
const router = Router();

router.use("/test", testRoutes);
router.use("/auth", loginRoutes);
router.use("/payment-accounts", paymentAccountsRoutes);
router.use("/customers", customersRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/otp", otpRoutes);

export default router;
