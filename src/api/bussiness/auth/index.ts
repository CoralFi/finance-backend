import { Router } from "express";
import { createCustomerController } from "./signUp";
const router = Router();
router.post("/signup", createCustomerController);

export default router;
