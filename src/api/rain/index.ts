import { Router } from "express";
import { createCustomer } from "./createCustomer";
import { kycStatus } from "./kycStatus";
import { createCard } from "./createCard";
import { authMiddleware } from "@/middleware/authMiddleware";
import { getCardById } from "./getCardById";
import { getCards } from "./getCards";

const router = Router();

/**
 * @route POST /api/quotes
 * @description Create a new quote for a transaction
 * @access Private
 */
router.post("/createCustomer", authMiddleware, createCustomer);
router.get("/kyc", authMiddleware, kycStatus)
router.post("/card", authMiddleware, createCard)
router.get("/card/:cardId", authMiddleware, getCardById)
router.get("/cards", authMiddleware, getCards)

export default router;
