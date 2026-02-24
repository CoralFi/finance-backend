import { Router } from "express";
import { createWallet } from "./createWallet";
const router = Router();

// /api/email/send-confirm-email
router.post('/create-waallet', createWallet);

export default router;
