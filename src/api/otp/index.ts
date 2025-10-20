import { Router } from "express";
import { generate2FAController } from "./generate2fa";
import { sendOtpController } from "./send-otp";
import {verifyGoogleAuthController} from "./validateGoogleAuth"
import {validateOtpController} from "./validateOtp"
const router = Router();

// Dynamic route: /payment-accounts/:paymentAccountId/balance
router.get("/generate-qr", generate2FAController);
router.post("/send-otp", sendOtpController);
router.post("/validate-google-auth", verifyGoogleAuthController);
router.post('/validateOtp', validateOtpController);

export default router;
