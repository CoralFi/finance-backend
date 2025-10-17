import { Router } from "express";
import { loginController } from "./login";

const router = Router();
router.post("/login", loginController);

export default router;
