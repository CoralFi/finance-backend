import { Router } from "express";
import { listCustomersController } from "./listCustomers";
import { getCustomerInfo } from "./getCustomerInfo";

const router = Router();

router.get("/", listCustomersController);
router.get("/:customerId", getCustomerInfo);

export default router;