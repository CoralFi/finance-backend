import { Router } from "express";
import { createCustomerController } from "./signUp";
import { resetPasswordHandler } from "./resetPasword";
const router = Router();

// api/bussiness/auth/signup
router.post("/signup", createCustomerController);

// api/bussiness/auth/signup
router.post("/reset-password", resetPasswordHandler);

export default router;
