import { Router } from "express";
import { sendConfirmEmailController } from "./confirmEmail";
import { sendCodeController } from "./sendCode";
import { verifyCodeController } from "./verifyCode";
const router = Router();
router.post('/send-confirm-email', sendConfirmEmailController);
router.post('/send-code', sendCodeController);
router.post('/verify-code', verifyCodeController);



export default router;
