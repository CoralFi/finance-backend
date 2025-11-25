import { Router } from "express";
import { loginController } from "./login";
import { registerUser } from "./signUp";
import { changePasswordController } from "./changePassword";
import { resetPasswordHandler } from "./resetPasword";
const router = Router();

// /api/auth/login
router.post("/login", loginController);
// /api/auth/signup
router.post("/signup", registerUser);
// /api/auth/change-password
router.post("/change-password", changePasswordController);
// api/bussiness/auth/signup
router.post("/reset-password", resetPasswordHandler);


export default router;
