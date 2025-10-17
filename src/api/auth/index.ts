import { Router } from "express";
import { loginController } from "./login";

const router = Router();
router.post("/", loginController);  // POST /api/auth

export default router;
