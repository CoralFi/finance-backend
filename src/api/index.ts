import { Router } from "express";
import testRoutes from "./test/index";
import loginRoutes from "./auth/index"
import paymentAccountsRoutes from "./paymentAcounts/index";
import otpRoutes from "./otp/index";
import customersRoutes from "./customers/index";
import transactionsRoutes from "./transactions/index";
import locationsRoutes from "./locations/index";
import emailRoutes from "./email/index";
import quotesRoutes from "./quotes/index";
import businessRoutes from "./bussiness/auth/index";
import customersBussRoutes from "./bussiness/customers/index";
import bankAccountRoutes from "./bussiness/bankAccount/index";
import accountsRoutes from "./bussiness/accounts/index";
import transactionsBussRoutes from "./bussiness/transactions/index"
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
// /api/locations
router.use("/locations", locationsRoutes);
// /api/email
router.use("/email", emailRoutes);
// /api/quotes
router.use("/quotes", quotesRoutes);
router.use("/auth/business", businessRoutes);
router.use("/business/customers", customersBussRoutes);
// /api/business/counterparties
router.use("/business/counterparties", bankAccountRoutes);
router.use("/business/accounts", accountsRoutes);
//transactions conduit 
router.use("/business/transactions", transactionsBussRoutes);
export default router;
