import { Router } from "express";
import { sendConfirmEmailController } from "./sendConfirmEmail";
import { sendCodeController } from "./sendCode";
import { verifyCodeController } from "./verifyCode";
import { sendResetPasswordEmail } from "./sendResetPasword";
const router = Router();

// /api/email/send-confirm-email
router.post('/send-confirm-email', sendConfirmEmailController);
// /api/email/send-code
router.post('/send-code', sendCodeController);
// /api/email/verify-code-db (usa función de base de datos con customer_id)
router.post('/verify-code', verifyCodeController);
// /api/email/verify-code-db (usa función de base de datos con customer_id)
router.post('/send-reset-password', sendResetPasswordEmail);


export default router;
