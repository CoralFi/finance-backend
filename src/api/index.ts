import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"
import paymentAccountsRoutes from "./paymentAcounts/index";
import otpRoutes from "./otp/index";
import customersRoutes from "./customers/index";
import transactionsRoutes from "./transactions/index";
import locationsRoutes from "./locations/index";
import emailRoutes from "./email/index";
const router = Router();

// /api/test
router.use("/test", testRoutes);
// /api/auth
router.use("/auth", loginRoutes);
// /api/payment-accounts
router.use("/payment-accounts", paymentAccountsRoutes);
// /api/customers
router.use("/customers", customersRoutes);
// /api/transactions
router.use("/transactions", transactionsRoutes);
// /api/otp
router.use("/otp", otpRoutes);
router.use("/locations", locationsRoutes);
router.use("/email", emailRoutes);
export default router;
