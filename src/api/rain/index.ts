import { Router } from "express";
import { createCustomer } from "./createCustomer";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();

/**
 * @route POST /api/quotes
 * @description Create a new quote for a transaction
 * @access Private
 */
router.post("/createCustomer", authMiddleware, createCustomer);
export default router;
