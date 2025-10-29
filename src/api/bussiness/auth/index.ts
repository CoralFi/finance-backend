import { Router } from "express";
import { createCustomerController } from "./signUp";
const router = Router();

// api/bussiness/auth/signup
router.post("/signup", createCustomerController);

export default router;
