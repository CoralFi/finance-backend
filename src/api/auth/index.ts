import { Router } from "express";
import { loginController } from "./login";
import { logoutController } from "./logout";
import { refreshController } from "./refresh";
import { getMeController } from "./me";
import { registerUser } from "./signUp";
import { changePasswordController } from "./changePassword";
import { resetPasswordHandler } from "./resetPasword";
import { authMiddleware } from "../../middleware/authMiddleware";
const router = Router();

// /api/auth/login
router.post("/login", loginController);
// /api/auth/logout
router.post("/logout", logoutController);
// /api/auth/me
router.get("/me", authMiddleware, getMeController);
// /api/auth/refresh
router.post("/refresh", refreshController);
// /api/auth/signup
router.post("/signup", registerUser);
// /api/auth/change-password
router.post("/change-password", changePasswordController);
// api/bussiness/auth/signup
router.post("/reset-password", resetPasswordHandler);


export default router;
