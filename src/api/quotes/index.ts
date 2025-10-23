import { createQuoteController } from "./quotes";
import express from "express";

export const router = express.Router();

// Create quote
// POST /api/quotes
router.post('/', createQuoteController);

export default router;
