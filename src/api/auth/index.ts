import { Router } from "express";
import { loginController } from "./login";
import { registerUser } from "./signUp";
const router = Router();

// /api/auth/login
router.post("/login", loginController);
// /api/auth/signup
router.post("/signup", registerUser);

export default router;
