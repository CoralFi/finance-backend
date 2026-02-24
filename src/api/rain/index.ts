import { Router } from "express";
import { createCustomer } from "./createCustomer";
import { kycStatus } from "./kycStatus";
import { createCard } from "./createCard";
import { authMiddleware } from "@/middleware/authMiddleware";
import { getCardById } from "./getCardById";
import { getCards } from "./getCards";
import { rainWebhook } from "./webhook";
import { getCardSecrets } from "./cardSecrets";
import { getBalances } from "./getBalances";
import { getOccupations } from "./ocupations";
import { getContract } from "./getContract";
import { getInfo } from "./getInfo";

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
router.get("/contract", authMiddleware, getContract)
router.post("/webhook", rainWebhook)
router.get("/card/:cardId/secrets", authMiddleware, getCardSecrets)
router.get("/balances", authMiddleware, getBalances)
router.get("/ocupations", getOccupations)
router.get("/user", authMiddleware,getInfo)

export default router;
