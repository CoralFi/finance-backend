import { Router } from "express";
import { createCompany } from "./createAccount"
import { authMiddleware } from "@/middleware/authMiddleware";
import { getLinkKycCompany } from "./getLinkKyc";
import { getCompanyContracts } from "./getContracts";
const router = Router();
router.post("/create", authMiddleware, createCompany);
router.get("/link-kyb", authMiddleware, getLinkKycCompany);
router.get("/contracts", authMiddleware, getCompanyContracts);
export default router;
