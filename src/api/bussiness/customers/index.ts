import { Router } from "express";
import { getAllCustomersController } from "./getAllCustomers";
import { getCustomerByIdController } from "./getCustomerById"
import { acceptTosController } from "./acceptTos"
import { authMiddleware } from "@/middleware/authMiddleware";

const router = Router();
// /api/business/customers
// router.get("/", authMiddleware, getAllCustomersController);
// /api/business/customers/:id
router.get("/", authMiddleware, getCustomerByIdController);
// /api/business/customers/accept-tos
router.get("/accept-tos", authMiddleware, acceptTosController);
export default router;
