import { Router } from "express";
import { loginController } from "./login";
import { registerUser } from "./signUp";
import { changePasswordController } from "./changePassword";
const router = Router();

// /api/auth/login
router.post("/login", loginController);
// /api/auth/signup
router.post("/signup", registerUser);
// /api/auth/change-password
router.post("/change-password", changePasswordController);

export default router;
