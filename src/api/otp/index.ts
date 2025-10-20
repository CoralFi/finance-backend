import { Router } from "express";
import { generate2FAController } from "./generate2fa";
import { sendOtpController } from "./send-otp";
import {verifyGoogleAuthController} from "./validateGoogleAuth"
import {validateOtpController} from "./validateOtp"
const router = Router();

// OTP Routes
// api/otp/generate-qr
router.get("/generate-qr", generate2FAController);
// api/otp/email
router.post("/email", sendOtpController);
// api/otp/validate-google-auth
router.post("/validate-google-auth", verifyGoogleAuthController);
// api/otp/validate-otp
router.post('/validate-otp', validateOtpController);

export default router;
