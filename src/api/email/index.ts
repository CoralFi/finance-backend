import { Router } from "express";
import { sendConfirmEmailController } from "./confirmEmail";
import { sendCodeController } from "./sendCode";
import { verifyCodeController } from "./verifyCode";
const router = Router();

// /api/email/send-confirm-email
router.post('/send-confirm-email', sendConfirmEmailController);
// /api/email/send-code
router.post('/send-code', sendCodeController);
// /api/email/verify-code-db (usa función de base de datos con customer_id)
router.post('/verify-code', verifyCodeController);



export default router;
