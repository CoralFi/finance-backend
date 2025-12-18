import { Router } from "express";
import { sendConfirmEmailController } from "./sendConfirmEmail";
import { confirmEmailController } from "./confirmEmail";
import { sendCodeController } from "./sendCode";
import { verifyCodeController } from "./verifyCode";
import { sendResetPasswordEmail } from "./sendResetPasword";
const router = Router();

// /api/email/send-confirm-email
router.post('/send-confirm-email', sendConfirmEmailController);
// /api/email/confirm-email (GET con token y email en query params)
router.get('/confirm-email', confirmEmailController);
// /api/email/send-code
router.post('/send-code', sendCodeController);
// /api/email/verify-code-db (usa función de base de datos con customer_id)
router.post('/verify-code', verifyCodeController);
// /api/email/verify-code-db (usa función de base de datos con customer_id)
router.post('/send-reset-password', sendResetPasswordEmail);


export default router;
