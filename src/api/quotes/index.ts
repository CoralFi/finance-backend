import { Router } from "express";
import { createQuoteController } from "./quotes";
import { createQuoteControllerConduit } from "./quotesConduit";
import { authMiddleware } from "@/middleware/authMiddleware";
const router = Router();

/**
 * @route POST /api/quotes
 * @description Create a new quote for a transaction
 * @access Private
 */
router.post("/", authMiddleware, createQuoteController);
router.post("/conduit", createQuoteControllerConduit);
export default router;
