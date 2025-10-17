import { Router } from "express";
import { loginController } from "./login";
import { registerUser } from "./signUp";
const router = Router();
router.post("/login", loginController);
router.post("/signup", registerUser);

export default router;
