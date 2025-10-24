import { Router } from "express";
import { createQuoteController } from "./quotes";

const router = Router();

/**
 * @route POST /api/quotes
 * @description Create a new quote for a transaction
 * @access Private
 */
router.post("/", createQuoteController);

export default router;
