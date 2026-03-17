import { Router } from "express"; 
import { createCompany } from "./createAccount"
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();
router.post("/create",  createCompany);
export default router;
