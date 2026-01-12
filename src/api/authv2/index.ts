import { Router } from "express";
import { loginController } from "./login";
import { logoutController } from "./logout";
import { refreshController } from "./refresh";
import { getMeController } from "./me";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();

router.post("/login", loginController);
// /api/auth/logout
router.post("/logout", logoutController);
// /api/auth/me
router.get("/me", authMiddleware, getMeController);
// /api/auth/refresh
router.post("/refresh", refreshController);


export default router;
