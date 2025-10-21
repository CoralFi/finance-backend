import { Router } from "express";
import { sendConfirmEmailController } from "./confirmEmail";
const router = Router();
router.post('/send-confirm-email', sendConfirmEmailController);


export default router;
