import { Router } from "express";
import { generate2FAController } from "./generate2fa";
import { verifyGoogleAuthController } from "./validateGoogleAuth"
const router = Router();

router.get("/generate-qr", generate2FAController);
router.post("/validate-google-auth", verifyGoogleAuthController);

export default router;
