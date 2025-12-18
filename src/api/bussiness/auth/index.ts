import { Router } from "express";
import { createCustomerController } from "./signUp";
import { resetPasswordHandler } from "./resetPasword";
import { changePasswordController } from "../auth/changePassword";

const router = Router();

// api/bussiness/auth/signup
router.post("/signup", createCustomerController);

// api/bussiness/auth/signup
router.post("/reset-password", resetPasswordHandler);


router.post("/change-password", changePasswordController);


export default router;
