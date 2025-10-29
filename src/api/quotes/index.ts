import { Router } from "express";
import { createQuoteController } from "./quotes";
import { createQuoteControllerConduit } from "./quotesConduit";
const router = Router();

/**
 * @route POST /api/quotes
 * @description Create a new quote for a transaction
 * @access Private
 */
router.post("/", createQuoteController);
router.post("/conduit", createQuoteControllerConduit);
export default router;
