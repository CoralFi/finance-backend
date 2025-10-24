import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"
import paymentAccountsRoutes from "./paymentAcounts/index";
import otpRoutes from "./otp/index";
import customersRoutes from "./customers/index";
import locationsRoutes from "./locations/index";
import emailRoutes from "./email/index";
import businessRoutes from "./bussiness/auth/index";
import customersBussRoutes from "./bussiness/customers/index";
const router = Router();

router.use("/test", testRoutes);
router.use("/auth", loginRoutes);
router.use("/payment-accounts", paymentAccountsRoutes);
router.use("/customers", customersRoutes);
router.use("/otp", otpRoutes);
router.use("/locations", locationsRoutes);
router.use("/email", emailRoutes);
router.use("/auth/business", businessRoutes);
router.use("/business/customers", customersBussRoutes);
export default router;
