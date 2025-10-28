import { Router } from "express";
import { getAllCustomersController } from "./getAllCustomers";
import { getCustomerByIdController } from "./getCustomerById"
const router = Router();
// /api/business/customers
router.get("/", getAllCustomersController);
// /api/business/customers/:id
router.get("/:id", getCustomerByIdController);
export default router;
