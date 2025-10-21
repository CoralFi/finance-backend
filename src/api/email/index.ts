import { Router } from "express";
import { sendConfirmEmailController } from "./confirmEmail";
import { sendCodeController } from "./sendCode";
const router = Router();
router.post('/send-confirm-email', sendConfirmEmailController);
router.post('/send-code', sendCodeController);


export default router;
